import { Router } from 'express'
import { db } from '../db/index.js'
import { fail, ok } from '../middleware/index.js'

const router = Router()

router.get('/', (_req, res) => {
  const stars = db.prepare('SELECT id, user_id as userId, nickname, avatar FROM stars WHERE enabled = 1').all()
  ok(res, stars)
})

router.post('/', (req, res) => {
  const { userId, nickname, avatar = '' } = req.body as {
    userId?: string
    nickname?: string
    avatar?: string
  }
  if (!userId || !nickname) return fail(res, '缺少 userId 或 nickname')

  try {
    const result = db
      .prepare('INSERT INTO stars (user_id, nickname, avatar) VALUES (?, ?, ?)')
      .run(userId, nickname, avatar)
    ok(res, { id: Number(result.lastInsertRowid), userId, nickname, avatar })
  } catch {
    fail(res, '明星已存在或添加失败')
  }
})

export default router
