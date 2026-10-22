import { Router } from 'express'
import { readDb, updateDb } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, sendError } from '../utils/http.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const db = await readDb()
    const messages = db.messages
      .filter(
        (message) =>
          (message.senderId === req.user.id &&
            message.receiverId === req.params.userId) ||
          (message.senderId === req.params.userId &&
            message.receiverId === req.user.id),
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    return res.json({ messages })
  }),
)

router.post(
  '/:userId',
  asyncHandler(async (req, res) => {
    const content = String(req.body.content || '').trim()

    if (!content) {
      return sendError(res, 400, 'Message content is required.')
    }

    const message = await updateDb((db) => {
      const receiver = db.users.find((user) => user.id === req.params.userId)

      if (!receiver) {
        return null
      }

      const newMessage = {
        id: crypto.randomUUID(),
        senderId: req.user.id,
        receiverId: receiver.id,
        content,
        timestamp: new Date().toISOString(),
      }

      db.messages.push(newMessage)
      return newMessage
    })

    if (!message) {
      return sendError(res, 404, 'Message recipient not found.')
    }

    return res.status(201).json({ message })
  }),
)

router.delete(
  '/:messageId',
  asyncHandler(async (req, res) => {
    const deleted = await updateDb((db) => {
      const messageIndex = db.messages.findIndex(
        (message) =>
          message.id === req.params.messageId &&
          message.senderId === req.user.id,
      )

      if (messageIndex === -1) {
        return false
      }

      db.messages.splice(messageIndex, 1)
      return true
    })

    if (!deleted) {
      return sendError(
        res,
        404,
        'Message not found or cannot be deleted.',
      )
    }

    return res.status(204).send()
  }),
)
export default router
