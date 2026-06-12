from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TextInput(BaseModel):
    text: str


class EmotionResult(BaseModel):
    emotion: str
    confidence: float


@router.post("/analyze/text", response_model=EmotionResult)
async def analyze_text(payload: TextInput):
    # TODO Phase 1: replace with BERT inference
    return EmotionResult(emotion="neutral", confidence=0.5)


@router.get("/state")
async def get_emotion_state():
    # TODO Phase 2: replace with fused multimodal state from orchestrator
    return {
        "current": "neutral",
        "confidence": 0.5,
        "sources": {"text": None, "audio": None, "face": None},
    }
