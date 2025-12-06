from fastapi import FastAPI, HTTPException, UploadFile, File, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

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
CONVEX_URL = os.getenv("CONVEX_URL", "https://steady-donkey-169.convex.cloud")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Database Configuration
TIDB_HOST = os.getenv("TIDB_HOST")
TIDB_PORT = os.getenv("TIDB_PORT")
TIDB_USERNAME = os.getenv("TIDB_USERNAME")
TIDB_PASSWORD = os.getenv("TIDB_PASSWORD")
TIDB_DATABASE = os.getenv("TIDB_DATABASE")

DATABASE_URL = f"mysql+pymysql://{TIDB_USERNAME}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/{TIDB_DATABASE}?ssl_verify_cert=true&ssl_verify_identity=true"

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

# Add middleware to log all requests for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests to help debug invalid HTTP request warnings"""
    try:
        # Only log actual API requests, not health checks or invalid requests
        path = request.url.path
        if path not in ["/", "/health", "/favicon.ico"]:
            print(f"📥 API Request: {request.method} {path}")
        
        response = await call_next(request)
        return response
    except Exception as e:
        # Silently handle invalid requests (they're usually from extensions or tools)
        if "Invalid HTTP request" not in str(e):
            print(f"❌ Error in request: {e}")
        raise

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4028", "http://127.0.0.1:4028"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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

class SubscriptionBase(BaseModel):
    service_name: str
    cost: float
    payment_date: datetime
    category: str
    description: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    subscription_id: int

    model_config = {
        "from_attributes": True
    }

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "FinanceAssist API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "database": "connected" if SessionLocal else "not configured"}

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
        # Use model_dump() for Pydantic v2, fallback to dict() for v1
        data_dict = data.model_dump() if hasattr(data, 'model_dump') else data.dict()
        
        query = text("""
            INSERT INTO transactions (user_id, amount, category, description, purchase_date)
            VALUES (:user_id, :amount, :category, :description, :purchase_date)
        """)

        result = db.execute(query, data_dict)
        db.commit()

        new_id = result.lastrowid

        transaction = db.execute(
            text("SELECT * FROM transactions WHERE id = :id"),
            {"id": new_id}
        ).fetchone()

        if not transaction:
            raise HTTPException(status_code=500, detail="Failed to retrieve created transaction")

        return row_to_dict(transaction)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error creating transaction: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/transactions", response_model=List[TransactionOut])
def get_all_transactions(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("SELECT * FROM transactions ORDER BY purchase_date DESC")).fetchall()
        return [row_to_dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    try:
        row = db.execute(
            text("SELECT * FROM transactions WHERE id = :id"),
            {"id": transaction_id}
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Transaction not found")

        return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, update: TransactionUpdate, db: Session = Depends(get_db)):
    try:
        # Use model_dump() for Pydantic v2, fallback to dict() for v1
        update_dict = update.model_dump() if hasattr(update, 'model_dump') else update.dict()
        updates = {k: v for k, v in update_dict.items() if v is not None}

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

        return row_to_dict(updated)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    try:
        # Check if transaction exists first
        existing = db.execute(
            text("SELECT * FROM transactions WHERE id = :id"),
            {"id": transaction_id}
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Transaction not found")

        db.execute(
            text("DELETE FROM transactions WHERE id = :id"),
            {"id": transaction_id}
        )
        db.commit()

        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to convert row to dict
def row_to_dict(row):
    """Convert SQLAlchemy Row to dictionary"""
    if row is None:
        return None
    try:
        # SQLAlchemy 2.0 style
        if hasattr(row, '_mapping'):
            return dict(row._mapping)
        # SQLAlchemy 1.4 style
        elif hasattr(row, '_asdict'):
            return row._asdict()
        # Fallback
        else:
            return dict(row)
    except Exception as e:
        print(f"Error converting row to dict: {e}")
        # Try to get column names and values manually
        if hasattr(row, 'keys'):
            return {key: getattr(row, key, None) for key in row.keys()}
        return dict(row)

# Function to create subscriptions table
def create_subscriptions_table(db: Session):
    """Create subscriptions table if it doesn't exist"""
    try:
        query = text("""
            CREATE TABLE IF NOT EXISTS subscriptions (
                subscription_id INT AUTO_INCREMENT PRIMARY KEY,
                service_name VARCHAR(100) NOT NULL,
                cost DECIMAL(10, 2) NOT NULL,
                payment_date TIMESTAMP NOT NULL,
                category VARCHAR(50) NOT NULL,
                description VARCHAR(100)
            )
        """)
        db.execute(query)
        db.commit()
        print("✅ Subscriptions table created successfully!")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Warning: Failed to create subscriptions table: {e}")

# Function to insert dummy subscriptions
def insert_dummy_subscriptions(db: Session):
    """Insert 5 dummy subscriptions for initial data"""
    try:
        # Check if subscriptions already exist
        result = db.execute(text("SELECT COUNT(*) as count FROM subscriptions")).fetchone()
        count_dict = row_to_dict(result) if result else {}
        count = count_dict.get('count', 0) if count_dict else 0
        if count > 0:
            print("✅ Dummy subscriptions already exist, skipping insertion.")
            return

        dummy_subscriptions = [
            {
                "service_name": "Netflix",
                "cost": 15.99,
                "payment_date": datetime(2024, 1, 15, 10, 0, 0),
                "category": "Entertainment",
                "description": "Monthly streaming subscription"
            },
            {
                "service_name": "Spotify Premium",
                "cost": 9.99,
                "payment_date": datetime(2024, 1, 20, 10, 0, 0),
                "category": "Entertainment",
                "description": "Music streaming service"
            },
            {
                "service_name": "Microsoft 365",
                "cost": 99.99,
                "payment_date": datetime(2024, 1, 1, 10, 0, 0),
                "category": "Productivity",
                "description": "Annual office suite subscription"
            },
            {
                "service_name": "Gym Membership",
                "cost": 49.99,
                "payment_date": datetime(2024, 1, 5, 10, 0, 0),
                "category": "Health & Fitness",
                "description": "Monthly gym access"
            },
            {
                "service_name": "Amazon Prime",
                "cost": 14.99,
                "payment_date": datetime(2024, 1, 10, 10, 0, 0),
                "category": "Shopping",
                "description": "Prime membership with free shipping"
            }
        ]

        for sub in dummy_subscriptions:
            query = text("""
                INSERT INTO subscriptions (service_name, cost, payment_date, category, description)
                VALUES (:service_name, :cost, :payment_date, :category, :description)
            """)
            db.execute(query, sub)
        
        db.commit()
        print("✅ 5 dummy subscriptions inserted successfully!")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Warning: Failed to insert dummy subscriptions: {e}")

# Subscription endpoints
@app.post("/subscriptions", response_model=SubscriptionOut)
def create_subscription(data: SubscriptionCreate, db: Session = Depends(get_db)):
    try:
        # Ensure table exists
        create_subscriptions_table(db)
        
        # Use model_dump() for Pydantic v2, fallback to dict() for v1
        data_dict = data.model_dump() if hasattr(data, 'model_dump') else data.dict()
        
        # Handle None description
        if data_dict.get('description') is None:
            data_dict['description'] = None
        
        query = text("""
            INSERT INTO subscriptions (service_name, cost, payment_date, category, description)
            VALUES (:service_name, :cost, :payment_date, :category, :description)
        """)

        result = db.execute(query, data_dict)
        db.commit()

        new_id = result.lastrowid

        subscription = db.execute(
            text("SELECT * FROM subscriptions WHERE subscription_id = :id"),
            {"id": new_id}
        ).fetchone()

        if not subscription:
            raise HTTPException(status_code=500, detail="Failed to retrieve created subscription")

        return row_to_dict(subscription)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error creating subscription: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/subscriptions", response_model=List[SubscriptionOut])
def get_all_subscriptions(db: Session = Depends(get_db)):
    try:
        # Ensure table exists
        create_subscriptions_table(db)
        rows = db.execute(text("SELECT * FROM subscriptions ORDER BY payment_date DESC")).fetchall()
        return [row_to_dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/subscriptions/{subscription_id}", response_model=SubscriptionOut)
def get_subscription(subscription_id: int, db: Session = Depends(get_db)):
    try:
        row = db.execute(
            text("SELECT * FROM subscriptions WHERE subscription_id = :id"),
            {"id": subscription_id}
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Subscription not found")

        return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get current date and time in malaysia timezone
def get_current_malaysia_time():
    import pytz
    malaysia_tz = pytz.timezone("Asia/Kuala_Lumpur")
    return datetime.now(malaysia_tz)

# Claude endpoint - Chat
@app.post("/claude", response_model=ChatResponse)
async def claude_chat_endpoint(request: ChatRequest):
    """
    Accepts a message from the user and returns a reply generated by Claude LLM.
    Context retrieval from documents is not yet implemented in this endpoint.
    """
    try:
        # Check if Claude client is available
        if claude_client is None:
            return ChatResponse(reply="Claude API key not configured.", contextUsed=False, chunksFound=0)

        # Compose system prompt for financial assistant
        system_prompt = (
            "You are an AI financial assistant helping users manage their personal finances. "
            "You can provide advice on budgeting, saving, spending analysis, debt management, "
            "and general financial planning. Be conversational, helpful, and provide actionable advice. "
            "If asked about specific transactions or data, acknowledge that you would need access to their "
            "transaction history to provide detailed analysis. Keep responses concise and friendly."

            "You are provided current date and time information: " + str(get_current_malaysia_time())
        )

        res = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": request.message},
            ],
        )

        # Extract first reply
        reply_text = res.content[0].text

        return ChatResponse(
            reply=reply_text,
            contextUsed=False,
            chunksFound=0
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

# Endpoint
@app.post("/public-speaking")
async def public_speaking_analysis(request: Request):
    try:
        # Check if ElevenLabs client is available
        if elevenlabs_client is None:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        audio_bytes = await request.body()

        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio provided")

        # 1️⃣ Transcribe + Emotion + Prosody (ElevenLabs)
        stt_result = elevenlabs_client.speech_to_text.convert(
            file=audio_bytes,
            model_id="scribe_v1",  # Prosody + Emotion
            language_code="en"
        )

        transcript = stt_result.text
        
        emotion = getattr(stt_result, "emotion", {})
        prosody = getattr(stt_result, "prosody", {})

        if not transcript:
            raise HTTPException(status_code=500, detail="Transcription failed")

        # 2️⃣ Prepare evaluation prompt for Claude
        system_prompt = """You are an advanced public-speaking evaluator.
        Analyze the user's speech using BOTH transcript content and voice characteristics.

        Return valid JSON ONLY with:
        - fluency_score (0-100)
        - grammar_score (0-100)
        - clarity_score (0-100)
        - pronunciation_score (0-100)
        - confidence_score (0-100)
        - filler_words (list)
        - pace_wpm
        - detected_emotion
        - suggestions (3-5 bullet points)
        - final_summary (2-4 sentences)"""

        user_prompt = f"""
        Transcript:
        {transcript}

        Voice Emotion:
        {emotion}

        Prosody (Pitch, Volume, Pace):
        {prosody}
        """

        # Check if Claude client is available
        if claude_client is None:
            raise HTTPException(status_code=500, detail="Claude API key not configured")

        # 3️Claude LLM Evaluation
        llm_response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.4,
        )

        evaluation = llm_response.content[0].text

        return {
            "transcript": transcript,
            "emotion": emotion,
            "prosody": prosody,
            "evaluation": evaluation
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Public Speaking Analysis failed: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize database tables and insert dummy data on startup"""
    if SessionLocal is not None:
        db = SessionLocal()
        try:
            create_subscriptions_table(db)
            insert_dummy_subscriptions(db)
        finally:
            db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)