from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PathFinder AI"
    
    # CORS
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./pathfinder_ai.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # External APIs
    MAPBOX_ACCESS_TOKEN: str = ""
    OPENWEATHER_API_KEY: str = ""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 