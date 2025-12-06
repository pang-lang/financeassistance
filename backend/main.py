"""
FastAPI Backend for Finance Assistance Application
Provides OCR receipt processing using Taggun API
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("application_starting", version="1.0.0")
    yield
    # Shutdown
    logger.info("application_shutting_down")


# Initialize FastAPI app
app = FastAPI(
    title="Finance Assistance OCR API",
    description="Backend API for receipt OCR processing using Taggun",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# API Endpoints
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Finance Assistance OCR API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


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
    status_code=status.HTTP_200_OK,
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
            status_code=status.HTTP_400_BAD_REQUEST,
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
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.max_upload_size / 1024 / 1024:.2f}MB"
            )
        
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
            
    except Exception as e:
        logger.error("error_reading_file", filename=file.filename, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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
            status_code=status.HTTP_502_BAD_GATEWAY,
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the receipt"
        )


@app.post(
    "/api/receipt/process-url",
    response_model=ReceiptUploadResponse,
    status_code=status.HTTP_200_OK,
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
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="URL processing not yet implemented. Please use file upload."
    )


# Development server runner
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )

