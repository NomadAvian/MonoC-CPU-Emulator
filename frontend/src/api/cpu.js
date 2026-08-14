const BASE = '' // same origin; /cpu and /ai are proxied to the crow server by vite

export async function fetchRegisters() {
  const res = await fetch(`${BASE}/cpu/registers`)
  if (!res.ok) throw new Error(`GET /cpu/registers failed: ${res.status}`)
  return res.json()
}

export async function stepCpu() {
  const res = await fetch(`${BASE}/cpu/step`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /cpu/step failed: ${res.status}`)
  return res.json()
}

export async function resetCpu() {
    const res = await fetch(`${BASE}/cpu/reset`, { method: `POST` })
    if (!res.ok) throw new Error(`POST /cpu/reset failed: ${res.status}`)
    return res.text()
}

export async function compile(source) {
    const res = await fetch(`${BASE}/cpu/compile`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
     })
    if (!res.ok) throw new Error(`POST /cpu/compile failed: ${res.status}`)
    return res.json()
}
