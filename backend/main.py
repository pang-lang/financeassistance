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
        "http://localhost:4028",     # You MUST add this
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)