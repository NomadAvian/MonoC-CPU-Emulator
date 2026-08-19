const CROW_BASE = 'http://localhost:6969'

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
  const res = await fetch(`${CROW_BASE}/cpu/screen`)
  if (!res.ok) throw new Error(`GET /cpu/screen failed: ${res.status}`)
  const widthStr = res.headers.get('X-Fb-Width')
  const heightStr = res.headers.get('X-Fb-Height')
  const width = widthStr ? Number(widthStr) : 128
  const height = heightStr ? Number(heightStr) : 96
  const buffer = await res.arrayBuffer()
  return { width, height, data: new Uint8Array(buffer) }
}
