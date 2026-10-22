import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'
import matchRoutes from './routes/matches.js'
import messageRoutes from './routes/messages.js'
import postRoutes from './routes/posts.js'
import profileRoutes from './routes/profile.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'eventmate-backend' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/matches', matchRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/posts', postRoutes)

  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
  })

  app.use((error, _req, res, _next) => {
    console.error(error)
    res.status(500).json({ error: 'Unexpected server error.' })
  })

  return app
}
