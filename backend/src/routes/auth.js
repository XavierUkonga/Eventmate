import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { updateDb } from '../data/db.js'
import { asyncHandler, publicUser, sendError } from '../utils/http.js'

const router = Router()

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  })
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { displayName, email, password } = req.body

    if (!displayName || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.')
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters.')
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await updateDb(async (db) => {
      if (db.users.some((candidate) => candidate.email === normalizedEmail)) {
        return null
      }

      const now = new Date().toISOString()
      const newUser = {
        id: crypto.randomUUID(),
        displayName: displayName.trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 12),
        bio: '',
        location: '',
        interests: [],
        photoURL: '',
        eventPreferences: [],
        ageRangePreference: '',
        distancePreference: 15,
        createdAt: now,
        updatedAt: now,
      }

      db.users.push(newUser)
      return newUser
    })

    if (!user) {
      return sendError(res, 409, 'An account with this email already exists.')
    }

    return res.status(201).json({
      token: issueToken(user),
      user: publicUser(user),
    })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.')
    }

    const normalizedEmail = email.trim().toLowerCase()
    let authenticatedUser = null

    await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.email === normalizedEmail)

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return
      }

      authenticatedUser = user
      user.lastLoginAt = new Date().toISOString()
    })

    if (!authenticatedUser) {
      return sendError(res, 401, 'Invalid email or password.')
    }

    return res.json({
      token: issueToken(authenticatedUser),
      user: publicUser(authenticatedUser),
    })
  }),
)

router.post('/logout', (_req, res) => {
  return res.status(204).send()
})

export default router
