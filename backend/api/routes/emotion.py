from fastapi import APIRouter
from pydantic import BaseModel
from models.text_emotion.classifier import classify_emotion

router = APIRouter()


class TextInput(BaseModel):
    """
    Request schema for text emotion analysis endpoint.

    Attributes:
        text (str): Input text to analyze for emotion detection.
    """
    text: str


class EmotionResult(BaseModel):
    """
    Response schema for text emotion analysis.

    Attributes:
        emotion (str): Predicted primary emotion from the text.
        confidence (float): Confidence score of the predicted emotion.
        all_scores (dict): Mapping of all detected emotions with their scores.
    """
    emotion: str
    confidence: float
    all_scores: dict


@router.post("/analyze/text", response_model=EmotionResult)
async def analyze_text(payload: TextInput):
    """
    Analyze the emotion expressed in the input text.

    Returns:
        EmotionResult: Emotion prediction and probability distribution.
    """
    result = classify_emotion(payload.text)
    return EmotionResult(**result)


@router.get("/state")
async def get_emotion_state():
    """
    Get the current global emotion state of the system.

    This endpoint returns a placeholder emotion state containing:
    - Current detected emotion
    - Confidence score
    - Emotion sources (text, audio, face)

    Returns:
        dict: Current emotion state snapshot.
    """
    return {
        "current": "neutral",
        "confidence": 0.5,
        "sources": {"text": None, "audio": None, "face": None},
    }
