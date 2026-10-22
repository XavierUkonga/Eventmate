import jwt from 'jsonwebtoken'
import { readDb } from '../data/db.js'
import { sendError } from '../utils/http.js'

export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return sendError(res, 401, 'Missing authentication token.')
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const db = await readDb()
    const user = db.users.find((candidate) => candidate.id === payload.sub)

    if (!user) {
      return sendError(res, 401, 'User account no longer exists.')
    }

    req.user = user
    next()
  } catch {
    return sendError(res, 401, 'Invalid or expired authentication token.')
  }
}
