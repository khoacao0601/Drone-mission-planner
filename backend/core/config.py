# Copyright (c) 2026 Khoa Cao. All rights reserved.

from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Flyby Mission Planning API"
    VERSION: str = "1.0.0"

    # Database Settings
    DATABASE_URL: str | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password123"
    POSTGRES_DB: str = "flyby_db"
    POSTGRES_PORT: int = 5433

    # JWT Authentication Configuration
    SECRET_KEY: str = "flyby-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 

    # Configure to path to file .env in root directory
    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()

if settings.DATABASE_URL:
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        DATABASE_URL = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgres://"):
        DATABASE_URL = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = db_url
else:
    DATABASE_URL = f"postgresql+psycopg2://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"