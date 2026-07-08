import whisper
from core.config import settings

_model = None


def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
    return _model


def transcribe(audio_path: str) -> str:
    model = get_model()
    result = model.transcribe(audio_path, fp16=False)
    return result["text"].strip()
