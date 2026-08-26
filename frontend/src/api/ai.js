const API_URL = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000'

export async function sendPrompt(messages, source) {
  const token = localStorage.getItem('auth_token')

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, source, token }),
  })

  if (!res.ok) {
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.detail || 'Daily AI usage limit reached.')
    }
    // throw new Error(`POST /chat failed: ${res.status} - ${await res.text()}`)
    throw new Error(`Something went wrong`)
  }

  return res.json()
}
