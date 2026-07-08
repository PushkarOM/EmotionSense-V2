from transformers import pipeline
from core.config import settings
from .labels import label_to_emotion
from .canonical import goemotions_to_canonical

_classifier = None


def get_classifier():
    """
    Load and return the emotion classification pipeline.

    Initializes the transformer model on first use and reuses the
    loaded instance for subsequent predictions.

    Returns:
        Pipeline: A Hugging Face text classification pipeline.
    """
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "text-classification",  # the tasked to be performed
            model=settings.EMOTION_MODEL_ID, # MODEL ID, model to be loaded from HF
            top_k=None,
        )
    return _classifier


def classify_emotion(text: str):
    """
    Classify the emotion expressed in a text input.

    Args:
        text (str): The text to analyze.

    Returns:
        dict: The predicted emotion, confidence score, and all emotion scores.
    """
    clf = get_classifier()
    results = clf(text, truncation=True, max_length=512)[0]
    mapped = [
        {"label": label_to_emotion(r["label"]), "score": round(r["score"], 4)}
        for r in results
    ]
    top = max(mapped, key=lambda x: x["score"])
    native = top["label"]
    canonical = goemotions_to_canonical(native)

    return {
        "native_emotion": native,
        "canonical_emotion": canonical,
        "confidence": top["score"],
        "all_scores": {r["label"]: r["score"] for r in mapped},
    }
