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


def generate_reply(message: str, emotion: str = "neutral") -> str:
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

    system_prompt = (
        f"You are an emotionally-aware assistant. "
        f"The user's detected emotional state is '{emotion}'. "
        f"Respond naturally and considerately given this context."
    )

    response = client.chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        max_tokens=256,
    )

    return response.choices[0].message.content
