const CROW_BASE = '' // same origin; /cpu is proxied to the crow server by vite

// multiuser: every request carries X-Session-Id and every response may
// return a (new) id — unknown/absent ids mint a fresh session server-side,
// so storing whatever comes back keeps the client self-healing
const SESSION_KEY = 'monoc_session_id'

function sessionId() {
  return localStorage.getItem(SESSION_KEY) || ''
}

function rememberSession(res) {
  const id = res.headers.get('X-Session-Id')
  if (id) localStorage.setItem(SESSION_KEY, id)
}

export async function fetchRegisters() {
  const res = await fetch(`${CROW_BASE}/cpu/registers`, {
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`GET /cpu/registers failed: ${res.status}`)
  return res.json()
}

export async function stepCpu(count = 1) {
  const url = count > 1 ? `${CROW_BASE}/cpu/step?count=${count}` : `${CROW_BASE}/cpu/step`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`POST /cpu/step failed: ${res.status}`)
  return res.json()
}

export async function resetCpu() {
  const res = await fetch(`${CROW_BASE}/cpu/reset`, {
    method: `POST`,
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`POST /cpu/reset failed: ${res.status}`)
  return res.text()
}

export async function compile(source) {
  const res = await fetch(`${CROW_BASE}/cpu/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId() },
    body: JSON.stringify({ source })
  })
  rememberSession(res)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const errorMsg = data?.error || data?.detail || `Compilation failed (${res.status})`
    throw new Error(errorMsg)
  }
  return data
}

// Fetches the emulator's accumulated console output.
export async function fetchOutput() {
  const res = await fetch(`${CROW_BASE}/cpu/output`, {
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`GET /cpu/output failed: ${res.status}`)
  const data = await res.json().catch(() => null)
  return { text: data?.text ?? '', len: data?.len ?? 0 }
}

// Feeds runtime input to the running program (read syscalls).
export async function sendInput(data) {
  const res = await fetch(`${CROW_BASE}/cpu/input`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId() },
    body: JSON.stringify({ data })
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`POST /cpu/input failed: ${res.status}`)
}

// Clears the emulator's accumulated console output.
export async function clearConsole() {
  const res = await fetch(`${CROW_BASE}/cpu/console-clear`, {
    method: 'POST',
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`POST /cpu/console-clear failed: ${res.status}`)
}

// Fetches the framebuffer (tail end of RAM, 768 words)
export async function fetchScreen() {
  const res = await fetch(`${CROW_BASE}/cpu/screen`, {
    headers: { 'X-Session-Id': sessionId() }
  })
  rememberSession(res)
  if (!res.ok) throw new Error(`GET /cpu/screen failed: ${res.status}`)
  const widthStr = res.headers.get('X-Fb-Width')
  const heightStr = res.headers.get('X-Fb-Height')
  const width = widthStr ? Number(widthStr) : 128
  const height = heightStr ? Number(heightStr) : 96
  const buffer = await res.arrayBuffer()
  return { width, height, data: new Uint8Array(buffer) }
}
