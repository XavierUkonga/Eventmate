import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { updateDb } from '../data/db.js'
import {
  asyncHandler,
  publicUser,
  sendError,
} from '../utils/http.js'

const router = Router()

function parseList(value) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? '').split(',')

  return [
    ...new Set(
      values
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ]
}

router.use(requireAuth)

router.get('/me', (req, res) => {
  return res.json({ user: publicUser(req.user) })
})

router.put(
  '/me',
  asyncHandler(async (req, res) => {
    const {
      displayName,
      bio,
      location,
      interests,
      photoURL,
      eventPreferences,
      ageRangePreference,
      distancePreference,
    } = req.body

    let parsedDistancePreference

    if (distancePreference !== undefined) {
      parsedDistancePreference = Number(distancePreference)

      if (
        !Number.isFinite(parsedDistancePreference) ||
        parsedDistancePreference < 1 ||
        parsedDistancePreference > 100
      ) {
        return sendError(
          res,
          400,
          'Distance preference must be between 1 and 100 miles.',
        )
      }
    }

    const user = await updateDb((db) => {
      const target = db.users.find(
        (candidate) => candidate.id === req.user.id,
      )

      if (displayName !== undefined && String(displayName).trim()) {
        target.displayName = String(displayName).trim()
      }

      if (bio !== undefined) {
        target.bio = String(bio).trim()
      }

      if (location !== undefined) {
        target.location = String(location).trim()
      }

      if (interests !== undefined) {
        target.interests = parseList(interests)
      }

      if (photoURL !== undefined) {
        target.photoURL = String(photoURL)
      }

      if (eventPreferences !== undefined) {
        target.eventPreferences = parseList(eventPreferences)
      }

      if (ageRangePreference !== undefined) {
        target.ageRangePreference =
          String(ageRangePreference).trim()
      }

      if (parsedDistancePreference !== undefined) {
        target.distancePreference = parsedDistancePreference
      }

      target.updatedAt = new Date().toISOString()

      return target
    })

    return res.json({ user: publicUser(user) })
  })
)

export default router
