const API_URL = 'http://localhost:8000'

export async function fetchExamples() {
  const res = await fetch(`${API_URL}/examples`)
  if (!res.ok) throw new Error(`GET /examples failed: ${res.status}`)
  return res.json()
}

export async function fetchExampleDetail(id) {
  const res = await fetch(`${API_URL}/examples/${id}`)
  if (!res.ok) throw new Error(`GET /examples/${id} failed: ${res.status}`)
  return res.json()
}
