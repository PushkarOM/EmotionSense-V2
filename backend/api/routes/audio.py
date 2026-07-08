import os
import tempfile
import subprocess
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from services.orchestrator import process_audio
from services.llm.generator import generate_reply

router = APIRouter()


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    input_path = None
    wav_path = None

    try:
        # Debug info
        print(f"Filename: {file.filename}")
        print(f"Content-Type: {file.content_type}")

        # Determine extension
        ext = Path(file.filename or "").suffix.lower()

        if not ext:
            mime_to_ext = {
                "audio/webm": ".webm",
                "audio/ogg": ".ogg",
                "audio/mp4": ".mp4",
                "audio/mpeg": ".mp3",
                "audio/wav": ".wav",
                "audio/x-wav": ".wav",
                "audio/aac": ".aac",
                "audio/flac": ".flac",
            }
            ext = mime_to_ext.get(file.content_type, ".bin")

        # Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            input_path = tmp.name

        # Create temporary WAV output
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            wav_path = tmp.name

        # Convert to 16kHz mono WAV
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                wav_path,
            ],
            check=True,
            capture_output=True,
            text=True,
        )

        # Run emotion pipeline
        result = process_audio(wav_path)

        # Generate LLM reply
        reply = generate_reply(
            message=result["transcript"],
            acoustic_emotion=result["acoustic"]["canonical_emotion"],
            semantic_emotion=(
                result["semantic"]["canonical_emotion"]
                if result.get("semantic")
                else None
            ),
            disagreement=result["disagreement"],
        )

        return {
            **result,
            "reply": reply,
        }

    except subprocess.CalledProcessError as e:
        print("========== FFMPEG ERROR ==========")
        print(e.stderr)
        print("==================================")

        raise HTTPException(
            status_code=500,
            detail="Failed to decode uploaded audio."
        )

    except Exception as e:
        print("Unexpected error:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if input_path and os.path.exists(input_path):
            os.unlink(input_path)

        if wav_path and os.path.exists(wav_path):
            os.unlink(wav_path)
