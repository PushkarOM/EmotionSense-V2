from fastapi import APIRouter
from pydantic import BaseModel
from services.orchestrator import process_text
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
    current_emotion: str
    confidence: float
    semantic: dict | None = None
    disagreement: bool = False


@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    """
    Chat endpoint that processes user input, detects emotion,
    and generates an emotionally-aware response.

    Returns:
        ChatResponse: Contains chatbot reply, detected emotion,
        and confidence score.
    """
    result = process_text(payload.message)

    reply = generate_reply(
        message=payload.message,
        acoustic_emotion=None,
        semantic_emotion=result["semantic"]["canonical_emotion"],
        disagreement=False,
    )

    return ChatResponse(
        reply=reply,
        current_emotion=result["current_emotion"],
        confidence=result["confidence"],
        semantic=result["semantic"],
        disagreement=False,
    )
