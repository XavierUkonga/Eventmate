import { Router } from 'express'
import { readDb, updateDb } from '../data/db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'

const router = Router()

function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const db = await readDb()
    const posts = [...db.posts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )

    return res.json({ posts })
  }),
)

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await updateDb((db) => {
      const newPost = {
        id: crypto.randomUUID(),
        authorId: req.user.id,
        author: req.user.displayName,
        initials: initialsFor(req.user.displayName),
        content: String(req.body.content || '').trim(),
        createdAt: new Date().toISOString(),
      }

      db.posts.push(newPost)
      return newPost
    })

    return res.status(201).json({ post })
  }),
)

export default router
