from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
import structlog
import logging
from datetime import datetime
from typing import Optional
import sys

from config import get_settings
from services.taggun_service import TaggunOCRService
from models.schemas import (
    ReceiptUploadResponse, 
    ErrorResponse, 
    HealthCheckResponse,
    ReceiptData
)

import os
import re
import time
from pathlib import Path
import requests
import markdown
from bs4 import BeautifulSoup

from elevenlabs import ElevenLabs
import anthropic

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Database Configuration
TIDB_HOST = os.getenv("TIDB_HOST")
TIDB_PORT = os.getenv("TIDB_PORT")
TIDB_USERNAME = os.getenv("TIDB_USERNAME")
TIDB_PASSWORD = os.getenv("TIDB_PASSWORD")
TIDB_DATABASE = os.getenv("TIDB_DATABASE")

DATABASE_URL = f"mysql+pymysql://{TIDB_USERNAME}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/{TIDB_DATABASE}?ssl_verify_cert=true&ssl_verify_identity=true"

# Configure logging
logging.basicConfig(
    format="%(message)s",
    stream=sys.stdout,
    level=logging.INFO,
)
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger(__name__)

# Get settings
settings = get_settings()

# Create database engine
engine = None
SessionLocal = None



try:
    # Create engine with SSL configuration for TiDB Cloud
    connect_args = {
        "ssl": {
            "ssl_mode": "VERIFY_IDENTITY"
        }
    }
    
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("✅ Database engine created successfully!")
except Exception as e:
    print(f"⚠️ Warning: Database connection failed: {e}")

# Set up Claude Client
claude_client = None
if ANTHROPIC_API_KEY is None:
    print("Warning: ANTHROPIC API key not configured.")
else:
    claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Set up ElevenLabs client
elevenlabs_client = None
if ELEVENLABS_API_KEY is None:
    print("Warning: ELEVENLABS API key not configured.")
else:
    elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

app = FastAPI(title="Hackathon RAG API")

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"📨 Incoming request: {request.method} {request.url}")
    print(f"   Origin: {request.headers.get('origin', 'No origin header')}")
    response = await call_next(request)
    # Force CORS header when origin is present (belt-and-suspenders)
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    print(f"✅ Response status: {response.status_code}")
    return response

# Configure CORS to allow frontend requests (simple wildcard, no credentials)
# Note: Browsers block wildcard + credentials, and our fetch calls do not send credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4028",
        "http://127.0.0.1:4028"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"📨 Incoming request: {request.method} {request.url}")
    print(f"   Origin: {request.headers.get('origin', 'No origin header')}")
    response = await call_next(request)
    # Force CORS header when origin is present (belt-and-suspenders)
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    print(f"✅ Response status: {response.status_code}")
    return response


# Helper function to get database session
def get_db():
    """Dependency to get database session"""
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    contextUsed: bool = False
    chunksFound: int = 0

class STTResponse(BaseModel):
    text: str
    language: Optional[str] = None

class TransactionBase(BaseModel):
    user_id: int
    amount: float
    category: Optional[str] = None
    description: Optional[str] = None
    purchase_date: datetime  

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    purchase_date: Optional[datetime] = None

class TransactionOut(TransactionBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


@app.post("/transactions", response_model=TransactionOut)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO transactions (user_id, amount, category, description, purchase_date)
            VALUES (:user_id, :amount, :category, :description, :purchase_date)
        """)

        result = db.execute(query, data.dict())
        db.commit()

        new_id = result.lastrowid

        transaction = db.execute(
            text("SELECT * FROM transactions WHERE id = :id"),
            {"id": new_id}
        ).fetchone()

        return transaction

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/cors-test")
def cors_test():
    return {"message": "CORS OK"}

@app.get("/transactions", response_model=List[TransactionOut])
def get_all_transactions(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM transactions ORDER BY purchase_date DESC")).fetchall()
    return rows

@app.get("/transactions/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM transactions WHERE id = :id"),
        {"id": transaction_id}
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return row

@app.put("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, update: TransactionUpdate, db: Session = Depends(get_db)):
    updates = {k: v for k, v in update.dict().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    set_clause = ", ".join([f"{key} = :{key}" for key in updates])
    updates["id"] = transaction_id

    db.execute(text(f"""
        UPDATE transactions SET {set_clause}
        WHERE id = :id
    """), updates)

    db.commit()

    updated = db.execute(
        text("SELECT * FROM transactions WHERE id = :id"),
        {"id": transaction_id}
    ).fetchone()

    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return updated

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db.execute(
        text("DELETE FROM transactions WHERE id = :id"),
        {"id": transaction_id}
    )
    db.commit()

    return {"message": "Transaction deleted successfully"}

# Get current date and time in malaysia timezone
def get_current_malaysia_time():
    import pytz
    malaysia_tz = pytz.timezone("Asia/Kuala_Lumpur")
    return datetime.now(malaysia_tz)

def get_all_transactions_data(db: Session):
    """
    Fetch all transactions from the database and return
    them as a list of dicts (easy to send to AI models).
    """
    rows = db.execute(
        text("SELECT * FROM transactions ORDER BY purchase_date DESC")
    ).fetchall()

    transactions = [dict(row._mapping) for row in rows]
    return transactions

def get_all_subscription_data(db: Session):
    """
    Fetch all subscriptions from the database and return
    them as a list of dicts (easy to send to AI models).
    """
    rows = db.execute(
        text("SELECT * FROM subscriptions ORDER BY payment_date DESC")
    ).fetchall()

    subscriptions = [dict(row._mapping) for row in rows]
    return subscriptions

@app.post("/claude", response_model=ChatResponse)
async def claude_chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Accepts a message from the user and returns a reply generated by Claude LLM.
    """
    try:
        if claude_client is None:
            return ChatResponse(reply="Claude API key not configured.", contextUsed=False, chunksFound=0)

        system_prompt = f"""
        You are an AI financial assistant helping users manage their personal finances.
        You can provide advice on budgeting, saving, spending analysis, debt management,
        and general financial planning. Be conversational, helpful, and provide actionable advice.

        Current Malaysia Time: {get_current_malaysia_time()}

        If the user asks about transactions, use the following data as reference:
        {get_all_transactions_data(db)}

        If the user asks about subscriptions, use the following data as reference:
        {get_all_subscription_data(db)}
        """

        res = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": request.message}],
        )

        reply_text = res.content[0].text

        return ChatResponse(
            reply=reply_text,
            contextUsed=True
        )

    except Exception as e:
        return ChatResponse(reply=f"Error generating Claude response: {str(e)}", contextUsed=False, chunksFound=0)
        
# Elevenlabs endpoint - Speech to Text
@app.post("/stt")
async def speech_to_text(request: Request):
    try:
        # Check if ElevenLabs client is available
        if elevenlabs_client is None:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        # Read raw binary audio directly from the request body
        audio_bytes = await request.body()

        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio received")

        # Call ElevenLabs STT
        transcription = elevenlabs_client.speech_to_text.convert(
            file=audio_bytes,
            model_id="scribe_v1",
            language_code = "eng"
        )

        return {"text": transcription.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT failed: {e}")

@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns the status of the API and its dependencies.
    """
    taggun_configured = await taggun_service.health_check()
    
    logger.info("health_check", taggun_configured=taggun_configured)
    
    return HealthCheckResponse(
        status="healthy" if taggun_configured else "degraded",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        taggun_configured=taggun_configured
    )


@app.post(
    "/api/receipt/process",
    response_model=ReceiptUploadResponse,
    status_code=200,
    tags=["Receipt Processing"]
)
async def process_receipt(
    file: UploadFile = File(..., description="Receipt image file (JPEG, PNG, HEIC, or PDF)")
):
    """
    Process a receipt image using Taggun OCR.
    
    Args:
        file: The receipt image file to process
        
    Returns:
        ReceiptUploadResponse containing the extracted receipt data
        
    Raises:
        HTTPException: If file validation fails or processing errors occur
    """
    start_time = datetime.utcnow()
    
    logger.info(
        "receipt_upload_received",
        filename=file.filename,
        content_type=file.content_type,
        size=file.size if hasattr(file, 'size') else 'unknown'
    )
    
    # Validate file type
    if file.content_type not in settings.allowed_mime_types:
        logger.warning(
            "invalid_file_type",
            filename=file.filename,
            content_type=file.content_type
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.allowed_mime_types)}"
        )
    
    # Read file content
    try:
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size
        if file_size > settings.max_upload_size:
            logger.warning(
                "file_too_large",
                filename=file.filename,
                size=file_size,
                max_size=settings.max_upload_size
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.max_upload_size / 1024 / 1024:.2f}MB"
            )
        
        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="File is empty"
            )
            
    except Exception as e:
        logger.error("error_reading_file", filename=file.filename, error=str(e))
        raise HTTPException(
            status_code=400,
            detail=f"Error reading file: {str(e)}"
        )
    
    # Process receipt with Taggun
    try:
        # Call Taggun API
        taggun_response = await taggun_service.process_receipt(
            file_content=file_content,
            filename=file.filename,
            content_type=file.content_type
        )
        
        # Parse the response
        receipt_data = taggun_service.parse_taggun_response(taggun_response)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        logger.info(
            "receipt_processed_successfully",
            filename=file.filename,
            processing_time=processing_time,
            merchant=receipt_data.store_name,
            total=receipt_data.total_amount
        )
        
        return ReceiptUploadResponse(
            success=True,
            message="Receipt processed successfully",
            data=receipt_data,
            processing_time=processing_time,
            raw_response=taggun_response if settings.debug else None
        )
        
    except ValueError as e:
        logger.error(
            "receipt_processing_error",
            filename=file.filename,
            error=str(e)
        )
        raise HTTPException(
            status_code=502,
            detail=f"Error processing receipt: {str(e)}"
        )
        
    except Exception as e:
        logger.error(
            "unexpected_processing_error",
            filename=file.filename,
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the receipt"
        )


# Initialize Taggun service
taggun_service = TaggunOCRService()


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    logger.error(
        "http_exception",
        path=request.url.path,
        status_code=exc.status_code,
        detail=exc.detail
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=str(exc.detail),
            error_code=f"HTTP_{exc.status_code}"
        ).model_dump(by_alias=True)
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        error=str(exc),
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            success=False,
            message="An internal server error occurred",
            error_code="INTERNAL_ERROR",
            details={"error": str(exc)} if settings.debug else {}
        ).model_dump(by_alias=True)
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("application_starting", version="1.0.0")
    yield
    # Shutdown
    logger.info("application_shutting_down")

@app.post(
    "/api/receipt/process-url",
    response_model=ReceiptUploadResponse,
    status_code=200,
    tags=["Receipt Processing"]
)

async def process_receipt_from_url(url: str):
    """
    Process a receipt from a URL.
    
    Args:
        url: URL of the receipt image
        
    Returns:
        ReceiptUploadResponse containing the extracted receipt data
    """
    # This endpoint could be implemented to download from URL and process
    # For now, returning a not implemented response
    raise HTTPException(
        status_code=501,
        detail="URL processing not yet implemented. Please use file upload."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)