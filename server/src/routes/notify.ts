import { Router } from 'express'
import { db } from '../db/index.js'
import { authMiddleware, fail, ok } from '../middleware/index.js'
import { env } from '../config/env.js'
import {
  isUserSubscribed,
  saveSubscription,
} from '../services/notify-subscribers.js'
import { isWechatNotifyConfigured } from '../services/wechat.js'

const router = Router()

router.get('/config', authMiddleware, (req, res) => {
  const templateId = env.wechat.subscribeTemplateId
  ok(res, {
    templateId: templateId || null,
    notifyConfigured: isWechatNotifyConfigured(),
    subscribed: templateId ? isUserSubscribed(req.user!.userId, templateId) : false,
  })
})

router.post('/subscribe', authMiddleware, (req, res) => {
  const { templateIds } = req.body as { templateIds?: string[] }
  if (!templateIds?.length) return fail(res, '缺少 templateIds')

  for (const templateId of templateIds) {
    saveSubscription(req.user!.userId, templateId)
  }

  ok(res, { success: true })
})

export default router
