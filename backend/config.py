import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    def __init__(self):
        # File upload settings
        self.allowed_mime_types: List[str] = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/heic",
            "application/pdf"
        ]
        
        # Max upload size in bytes (default: 10MB)
        max_size_mb = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
        self.max_upload_size: int = max_size_mb * 1024 * 1024
        
        # Debug mode
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"


_settings_instance: Settings = None


def get_settings() -> Settings:
    """Get the settings instance (singleton pattern)."""
    global _settings_instance
    if _settings_instance is None:
        _settings_instance = Settings()
    return _settings_instance
