export const API = process.env.NEXT_PUBLIC_API_URL

export async function apiGet<T>(path: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Error ${res.status}`)
  }
  const json = await res.json()
  return json as { message: string; codigo: string; data: T }
}

export async function apiPost<T>(path: string, body: unknown) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Error ${res.status}`)
  }
  const json = await res.json()
  return json as { message: string; codigo: string; data: T }
}
