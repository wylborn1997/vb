import express from 'express'
import cors from 'cors'
import os from 'os'
import authRoutes from './routes/auth.js'
import starRoutes from './routes/stars.js'
import feedRoutes from './routes/feed.js'
import weiboRoutes from './routes/weibo.js'
import commentRoutes from './routes/comments.js'
import templateRoutes from './routes/templates.js'
import notifyRoutes from './routes/notify.js'
import adminRoutes from './routes/admin.js'
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
app.use('/notify', notifyRoutes)
app.use('/admin', adminRoutes)

function getLanAddresses() {
  const ips: string[] = []
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address)
    }
  }
  return ips
}

app.listen(env.port, '0.0.0.0', () => {
  console.log(`Server running at http://127.0.0.1:${env.port}`)
  for (const ip of getLanAddresses()) {
    console.log(`局域网访问: http://${ip}:${env.port}  （真机调试请用此地址）`)
  }
  startMonitorJob()
})
