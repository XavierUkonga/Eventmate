const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:4000/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('eventmateToken')

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'Unable to reach the EventMate backend.',
    )
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || 'The request failed.',
    )
  }

  return data
}