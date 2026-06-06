import { Router } from 'express'
import { db } from '../db/index.js'
import { fail, ok } from '../middleware/index.js'

const router = Router()

router.post('/subscribe', (req, res) => {
  const userId = req.user?.userId
  if (!userId) return fail(res, '未登录', 401)

  const { templateIds } = req.body as { templateIds?: string[] }
  if (!templateIds?.length) return fail(res, '缺少 templateIds')

  const stmt = db.prepare('INSERT INTO subscriptions (user_id, template_id) VALUES (?, ?)')
  for (const templateId of templateIds) {
    stmt.run(userId, templateId)
  }

  ok(res, null)
})

export default router
