const CROW_BASE = '' // same origin; /cpu and /ai are proxied to the crow server by vite

export async function fetchRegisters() {
  const res = await fetch(`${CROW_BASE}/cpu/registers`)
  if (!res.ok) throw new Error(`GET /cpu/registers failed: ${res.status}`)
  return res.json()
}

export async function stepCpu(count = 1) {
  const url = count > 1 ? `${CROW_BASE}/cpu/step?count=${count}` : `${CROW_BASE}/cpu/step`
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /cpu/step failed: ${res.status}`)
  return res.json()
}

export async function runCpu() {
  const res = await fetch(`${BASE}/cpu/run`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /cpu/run failed: ${res.status}`)
  return res.json()
}

export async function resetCpu() {
  const res = await fetch(`${CROW_BASE}/cpu/reset`, { method: `POST` })
  if (!res.ok) throw new Error(`POST /cpu/reset failed: ${res.status}`)
  return res.text()
}

export async function compile(source) {
  const res = await fetch(`${CROW_BASE}/cpu/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source })
  })
  if (!res.ok) throw new Error(`POST /cpu/compile failed: ${res.status}`)
  return res.json()
}

// Fetches the framebuffer (tail end of RAM, 768 words)
export async function fetchScreen() {
  const res = await fetch(`${BASE}/cpu/screen`)
  if (!res.ok) throw new Error(`GET /cpu/screen failed: ${res.status}`)
  const width = Number(res.headers.get('X-Fb-Width') ?? 0)
  const height = Number(res.headers.get('X-Fb-Height') ?? 0)
  const buffer = await res.arrayBuffer()
  return { width, height, data: new Uint8Array(buffer) }
}
