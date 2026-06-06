import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import starRoutes from './routes/stars.js'
import feedRoutes from './routes/feed.js'
import weiboRoutes from './routes/weibo.js'
import commentRoutes from './routes/comments.js'
import templateRoutes from './routes/templates.js'
import notifyRoutes from './routes/notify.js'
import { authMiddleware } from './middleware/index.js'
import { initSchema } from './db/index.js'
import { startMonitorJob } from './jobs/monitor.js'
import { env } from './config/env.js'

initSchema()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/auth', authRoutes)
app.use('/stars', starRoutes)
app.use('/feed', feedRoutes)
app.use('/weibo', weiboRoutes)
app.use('/comments', commentRoutes)
app.use('/templates', templateRoutes)
app.use('/notify', authMiddleware, notifyRoutes)

app.listen(env.port, () => {
  console.log(`Server running at http://localhost:${env.port}`)
  startMonitorJob()
})
