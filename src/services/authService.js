import { apiRequest } from './apiClient'

const TOKEN_KEY = 'eventmateToken'
const USER_KEY = 'eventmateUser'
const LOGIN_KEY = 'eventmateLoggedIn'

function normalizeUser(user) {
  return {
    ...user,
    avatarUrl:
      user.avatarUrl || user.photoURL || '',
    city:
      user.city || user.location || '',
    interests: Array.isArray(user.interests)
      ? user.interests.join(', ')
      : user.interests || '',
  }
}

function saveSession(data) {
  const user = normalizeUser(data.user)

  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  )
  localStorage.setItem(LOGIN_KEY, 'true')

  window.dispatchEvent(
    new Event('eventmate-profile-updated'),
  )

  return user
}

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })

  return saveSession(data)
}

export async function register(
  displayName,
  email,
  password,
) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      displayName,
      email,
      password,
    }),
  })

  return saveSession(data)
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    })
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(LOGIN_KEY)

    window.dispatchEvent(
      new Event('eventmate-profile-updated'),
    )
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function getStoredUser() {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem(USER_KEY) || 'null',
    )

    return savedUser
      ? normalizeUser(savedUser)
      : null
  } catch {
    return null
  }
}