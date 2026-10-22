import 'dotenv/config'
import { createApp } from './app.js'

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'eventmate-local-development-secret'
}

const port = Number(process.env.PORT || 4000)
const app = createApp()

app.listen(port, () => {
  console.log(`EventMate backend running at http://localhost:${port}`)
})
