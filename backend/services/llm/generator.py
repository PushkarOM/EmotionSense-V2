from huggingface_hub import InferenceClient
from core.config import settings

_client = None


def get_client():
    """
    Initialize and return a cached Hugging Face InferenceClient.

    Creates the client on first use and reuses the same instance for
    all subsequent calls to avoid repeated initialization overhead.

    Returns:
        _client (InferenceClient) : Authenticated Hugging Face inference client.
    """

    global _client
    if _client is None:
        _client = InferenceClient(
            model=settings.LLM_MODEL_ID,
            token=settings.HF_TOKEN,
        )
    return _client


def generate_reply(
    message: str,
    acoustic_emotion: str | None = None,
    semantic_emotion: str | None = None,
    disagreement: bool = False,
) -> str:
    """
    Generate an emotionally-aware response using a language model.

    The function sends the user's message along with their detected
    emotional state to a chat-based LLM and returns a context-aware reply.

    Args:
        message (str): The user's input message.
        emotion (str, optional): Detected emotional state of the user.
            Defaults to "neutral".

    Returns:
        str: The generated response from the language model.
    """
    
    client = get_client()

    # build emotional context string
    if acoustic_emotion and semantic_emotion:
        if disagreement:
            emotion_context = (
                f"[Emotional context: voice tone suggests {acoustic_emotion}, "
                f"words suggest {semantic_emotion}. Possible masked or suppressed emotion.]"
            )
        else:
            emotion_context = f"[Emotional context: {acoustic_emotion}.]"
    elif acoustic_emotion:
        emotion_context = f"[Emotional context: {acoustic_emotion}.]"
    elif semantic_emotion:
        emotion_context = f"[Emotional context: {semantic_emotion}.]"
    else:
        emotion_context = ""

    system_prompt = (
        "You are a warm, intelligent conversational AI. "
        "You have been given emotional context about the user below. "
        "Use this context to subtly inform your tone, pacing, and response — "
        "but do NOT explicitly mention the emotion, label it, or say things like "
        "'I can sense you are feeling X' or 'you sound Y'. "
        "Just respond naturally and appropriately as a perceptive person would. "
        f"{emotion_context}"
    )

    response = client.chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        max_tokens=256,
    )

    return response.choices[0].message.content
