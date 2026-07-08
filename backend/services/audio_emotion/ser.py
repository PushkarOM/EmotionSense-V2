import torch
import torchaudio
from transformers import Wav2Vec2ForSequenceClassification, AutoFeatureExtractor
from core.config import settings

_model = None
_processor = None

CANONICAL_LABELS = {
    0: "neutral", 1: "happy", 2: "sad", 3: "angry",
    4: "fear", 5: "disgust", 6: "surprise", 7: "frustration"
}


def get_model():
    global _model, _processor
    if _model is None:
        _processor = AutoFeatureExtractor.from_pretrained(settings.AUDIO_EMOTION_MODEL_ID)
        _model = Wav2Vec2ForSequenceClassification.from_pretrained(settings.AUDIO_EMOTION_MODEL_ID)
        _model.to(settings.DEVICE)
        _model.eval()
    return _model, _processor


def classify_audio(audio_path: str) -> dict:
    model, processor = get_model()

    waveform, sample_rate = torchaudio.load(audio_path)

    # resample to 16kHz if needed
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)

    # mono
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    waveform = waveform.squeeze().numpy()

    inputs = processor(
        waveform,
        sampling_rate=16000,
        return_tensors="pt",
        padding=True,
    )
    inputs = {k: v.to(settings.DEVICE) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1).squeeze().cpu().tolist()
    top_idx = int(torch.argmax(logits).item())
    canonical = CANONICAL_LABELS[top_idx]

    return {
        "native_emotion": canonical,   
        "canonical_emotion": canonical,
        "confidence": round(probs[top_idx], 4),
        "all_scores": {
            CANONICAL_LABELS[i]: round(p, 4) for i, p in enumerate(probs)
        }
    }
