from pydantic_settings import BaseSettings
from typing import List
import torch


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True

    CORS_ORIGINS: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/emotionsense"

    HF_TOKEN: str = ""
    EMOTION_MODEL_ID: str = "PushkarOM/roberta-head-goemotion"
    LLM_MODEL_ID: str = "meta-llama/Llama-3.1-8B-Instruct"

    SHORT_TERM_WINDOW: int = 10
    LONG_TERM_ENABLED: bool = False

    WHISPER_MODEL_SIZE: str = "base"
    AUDIO_EMOTION_MODEL_ID: str = "PushkarOM/wav2vec2-ser-v1"
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


settings = Settings()