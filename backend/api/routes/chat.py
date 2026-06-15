from fastapi import APIRouter
from pydantic import BaseModel
from services.text_emotion.classifier import classify_emotion
from services.llm.generator import generate_reply

router = APIRouter()


class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint.

    Attributes:
        message (str): The user's input message to the chatbot.
    """
    message: str


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint.

    Attributes:
        reply (str): The generated response from the assistant.
        emotion (str): Detected emotion from the user's message.
        confidence (float): Confidence score of the predicted emotion.
    """
    reply: str
    emotion: str
    confidence: float


@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    """
    Chat endpoint that processes user input, detects emotion,
    and generates an emotionally-aware response.

    Returns:
        ChatResponse: Contains chatbot reply, detected emotion,
        and confidence score.
    """
    emotion_result = classify_emotion(payload.message)
    reply = generate_reply(payload.message, emotion=emotion_result["emotion"])

    return ChatResponse(
        reply=reply,
        emotion=emotion_result["emotion"],
        confidence=emotion_result["confidence"],
    )
