from services.audio_emotion.ser import classify_audio
from services.audio_emotion.transcriber import transcribe
from services.text_emotion.classifier import classify_emotion


def process_audio(audio_path: str) -> dict:
    acoustic = classify_audio(audio_path)
    transcript = transcribe(audio_path)

    semantic = None
    if transcript:
        semantic = classify_emotion(transcript)

    disagreement = (
        semantic is not None and
        semantic["canonical_emotion"] != acoustic["canonical_emotion"]
    )

    return {
        "current_emotion": acoustic["canonical_emotion"],
        "confidence": acoustic["confidence"],
        "transcript": transcript,
        "acoustic": acoustic,
        "semantic": semantic,
        "disagreement": disagreement,
        "sources": {
            "text": None,
            "audio": acoustic["canonical_emotion"],
            "face": None,
        }
    }


def process_text(text: str) -> dict:
    result = classify_emotion(text)
    return {
        "current_emotion": result["canonical_emotion"],
        "confidence": result["confidence"],
        "transcript": text,
        "acoustic": None,
        "semantic": result,
        "disagreement": False,
        "sources": {
            "text": result["canonical_emotion"],
            "audio": None,
            "face": None,
        }
    }
