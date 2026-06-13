const BASE_URL = "http://localhost:8000"

export async function sendChatMessage(message) {
  const res = await fetch(`${BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) throw new Error("Chat request failed")
  return res.json()  // { reply, emotion, confidence }
}

export async function getEmotionState() {
  const res = await fetch(`${BASE_URL}/emotion/state`)
  if (!res.ok) throw new Error("Failed to fetch emotion state")
  return res.json()
}