import { Router } from 'express'
import { authMiddleware, adminMiddleware, fail, ok } from '../middleware/index.js'
import { getMonitorStatus, runMonitorCheck } from '../jobs/monitor.js'
import { setMonitorEnabled } from '../services/settings.js'
import { isWechatNotifyConfigured } from '../services/wechat.js'
import { db } from '../db/index.js'
import { env } from '../config/env.js'

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get('/status', (_req, res) => {
  const monitor = getMonitorStatus()
  const starCount = db.prepare('SELECT COUNT(*) as c FROM stars').get() as { c: number }

  ok(res, {
    monitorEnabled: monitor.enabled,
    monitorConfigured: monitor.configured,
    monitorRunning: monitor.running,
    monitorLastRunAt: monitor.lastRunAt,
    notifyConfigured: isWechatNotifyConfigured(),
    subscribeTemplateId: env.wechat.subscribeTemplateId || null,
    starCount: starCount.c,
    adminRestricted: env.adminOpenids.length > 0,
  })
})

router.patch('/monitor', (req, res) => {
  const { enabled } = req.body as { enabled?: boolean }
  if (typeof enabled !== 'boolean') return fail(res, '缺少 enabled 布尔值')

  setMonitorEnabled(enabled)
  ok(res, { enabled })
})

router.post('/monitor/run', async (_req, res) => {
  try {
    await runMonitorCheck()
    ok(res, getMonitorStatus())
  } catch (e) {
    fail(res, (e as Error).message, 500)
  }
})

export default router
