from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    emotion: str


@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    # TODO Phase 1: replace with HF text-generation model call
    # TODO Phase 2: fuse emotion state into prompt before generation
    return ChatResponse(
        reply=f"You said: '{payload.message}'. (placeholder response)",
        emotion="neutral",
    )
