import { Router } from 'express'
import { readDb, updateDb } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, sendError } from '../utils/http.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { city, search } = req.query
    const normalizedCity = city?.toLowerCase()
    const normalizedSearch = search?.toLowerCase()
    const db = await readDb()

    const events = db.events.filter((event) => {
      const cityMatches = normalizedCity
        ? event.city.toLowerCase() === normalizedCity
        : true
      const searchMatches = normalizedSearch
        ? [event.title, event.category, event.venue, event.description]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true

      return cityMatches && searchMatches
    })

    return res.json({ events })
  }),
)

router.get(
  '/:eventId',
  asyncHandler(async (req, res) => {
    const db = await readDb()
    const event = db.events.find((candidate) => candidate.id === req.params.eventId)

    if (!event) {
      return sendError(res, 404, 'Event not found.')
    }

    return res.json({ event })
  }),
)

router.post(
  '/:eventId/attendance',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.body.status || 'going'

    const attendance = await updateDb((db) => {
      const event = db.events.find((candidate) => candidate.id === req.params.eventId)

      if (!event) {
        return null
      }

      const existing = db.attendance.find(
        (record) =>
          record.userId === req.user.id && record.eventId === req.params.eventId,
      )

      if (existing) {
        existing.status = status
        existing.dateSelected = new Date().toISOString()
        return existing
      }

      const newAttendance = {
        id: crypto.randomUUID(),
        userId: req.user.id,
        eventId: req.params.eventId,
        status,
        dateSelected: new Date().toISOString(),
      }

      db.attendance.push(newAttendance)
      return newAttendance
    })

    if (!attendance) {
      return sendError(res, 404, 'Event not found.')
    }

    return res.status(201).json({ attendance })
  }),
)

export default router
