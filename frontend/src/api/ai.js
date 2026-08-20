const API_URL = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000'

export async function sendPrompt(messages, source) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, source }),
  })

  if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`POST /chat failed: ${res.status} - ${errorText}`)
  }

  return res.json()
}
