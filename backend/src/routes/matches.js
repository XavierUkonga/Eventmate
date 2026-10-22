import { Router } from 'express'
import {
  readDb,
  updateDb,
} from '../data/db.js'
import {
  requireAuth,
} from '../middleware/auth.js'
import {
  asyncHandler,
  publicUser,
  sendError,
} from '../utils/http.js'

const router = Router()

router.use(requireAuth)

function sharedInterests(first = [], second = []) {
  const normalized = new Set(
    first.map((interest) =>
      interest.toLowerCase(),
    ),
  )

  return second.filter((interest) =>
    normalized.has(interest.toLowerCase()),
  )
}

function activeAttendance(record) {
  return (
    record.status !== 'not_interested' &&
    record.status !== 'not_attending'
  )
}

function matchForUsers(
  matches,
  firstUserId,
  secondUserId,
) {
  return matches.find(
    (match) =>
      match.userIds.includes(firstUserId) &&
      match.userIds.includes(secondUserId),
  )
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const db = await readDb()

    const matches = db.matches
      .filter((match) =>
        match.userIds.includes(req.user.id),
      )
      .map((match) => {
        const otherUserId =
          match.userIds.find(
            (id) => id !== req.user.id,
          )

        const otherUser = db.users.find(
          (user) => user.id === otherUserId,
        )

        return {
          ...match,
          direction:
            match.requestedBy === req.user.id
              ? 'outgoing'
              : 'incoming',
          otherUser: otherUser
            ? publicUser(otherUser)
            : null,
        }
      })
      .filter((match) => match.otherUser)

    return res.json({ matches })
  }),
)

router.get(
  '/recommendations',
  asyncHandler(async (req, res) => {
    const db = await readDb()

    const currentEventIds = new Set(
      db.attendance
        .filter(
          (record) =>
            record.userId === req.user.id &&
            activeAttendance(record),
        )
        .map((record) => record.eventId),
    )

    const recommendations = db.users
      .filter(
        (user) => user.id !== req.user.id,
      )
      .map((user) => {
        const interests = sharedInterests(
          req.user.interests,
          user.interests,
        )

        const sharedEventIds = db.attendance
          .filter(
            (record) =>
              record.userId === user.id &&
              activeAttendance(record) &&
              currentEventIds.has(
                record.eventId,
              ),
          )
          .map((record) => record.eventId)

        const existingMatch = matchForUsers(
          db.matches,
          req.user.id,
          user.id,
        )

        return {
          user: publicUser(user),
          sharedInterests: interests,
          sharedEventIds,
          sameEventCount:
            sharedEventIds.length,
          score:
            interests.length * 10 +
            sharedEventIds.length * 5,
          match: existingMatch
            ? {
                id: existingMatch.id,
                status: existingMatch.status,
                requestedBy:
                  existingMatch.requestedBy,
              }
            : null,
        }
      })
      .filter(
        (recommendation) =>
          recommendation.score > 0 ||
          recommendation.match,
      )
      .sort((first, second) =>
        second.score - first.score,
      )

    return res.json({ recommendations })
  }),
)

router.post(
  '/request',
  asyncHandler(async (req, res) => {
    const { receiverId } = req.body

    const match = await updateDb((db) => {
      const receiver = db.users.find(
        (user) => user.id === receiverId,
      )

      if (
        !receiver ||
        receiver.id === req.user.id
      ) {
        return null
      }

      const existing = matchForUsers(
        db.matches,
        req.user.id,
        receiver.id,
      )

      if (existing) {
        return existing
      }

      const newMatch = {
        id: crypto.randomUUID(),
        userIds: [
          req.user.id,
          receiver.id,
        ],
        requestedBy: req.user.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        matchedAt: null,
      }

      db.matches.push(newMatch)

      return newMatch
    })

    if (!match) {
      return sendError(
        res,
        404,
        'Recommended user not found.',
      )
    }

    return res.status(201).json({ match })
  }),
)

router.post(
  '/:matchId/accept',
  asyncHandler(async (req, res) => {
    const match = await updateDb((db) => {
      const target = db.matches.find(
        (candidate) =>
          candidate.id ===
            req.params.matchId &&
          candidate.userIds.includes(
            req.user.id,
          ) &&
          candidate.requestedBy !==
            req.user.id &&
          candidate.status === 'pending',
      )

      if (!target) {
        return null
      }

      target.status = 'accepted'
      target.matchedAt =
        new Date().toISOString()

      return target
    })

    if (!match) {
      return sendError(
        res,
        404,
        'Incoming match request not found.',
      )
    }

    return res.json({ match })
  }),
)

router.delete(
  '/:matchId',
  asyncHandler(async (req, res) => {
    const removed = await updateDb((db) => {
      const index = db.matches.findIndex(
        (match) =>
          match.id === req.params.matchId &&
          match.userIds.includes(req.user.id),
      )

      if (index === -1) {
        return false
      }

      db.matches.splice(index, 1)
      return true
    })

    if (!removed) {
      return sendError(
        res,
        404,
        'Connection request not found.',
      )
    }

    return res.status(204).send()
  }),
)

export default router