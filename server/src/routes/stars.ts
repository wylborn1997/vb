import { Router } from 'express'
import { db } from '../db/index.js'
import { authMiddleware, adminMiddleware, fail, ok } from '../middleware/index.js'

const router = Router()

router.get('/', (_req, res) => {
  const stars = db
    .prepare(
      'SELECT id, user_id as userId, nickname, avatar FROM stars WHERE enabled = 1 ORDER BY id ASC'
    )
    .all()
  ok(res, stars)
})

router.get('/manage', authMiddleware, adminMiddleware, (_req, res) => {
  const stars = db
    .prepare(
      'SELECT id, user_id as userId, nickname, avatar, enabled FROM stars ORDER BY id ASC'
    )
    .all()
  ok(res, stars)
})

router.use(authMiddleware, adminMiddleware)

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
      .run(userId.trim(), nickname.trim(), avatar.trim())
    ok(res, {
      id: Number(result.lastInsertRowid),
      userId: userId.trim(),
      nickname: nickname.trim(),
      avatar: avatar.trim(),
      enabled: 1,
    })
  } catch {
    fail(res, '明星已存在或添加失败')
  }
})

router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const { nickname, avatar, enabled } = req.body as {
    nickname?: string
    avatar?: string
    enabled?: boolean
  }

  const star = db.prepare('SELECT id FROM stars WHERE id = ?').get(id)
  if (!star) return fail(res, '明星不存在', 404)

  if (nickname !== undefined) {
    db.prepare('UPDATE stars SET nickname = ? WHERE id = ?').run(nickname.trim(), id)
  }
  if (avatar !== undefined) {
    db.prepare('UPDATE stars SET avatar = ? WHERE id = ?').run(avatar.trim(), id)
  }
  if (enabled !== undefined) {
    db.prepare('UPDATE stars SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id)
  }

  const updated = db
    .prepare('SELECT id, user_id as userId, nickname, avatar, enabled FROM stars WHERE id = ?')
    .get(id)
  ok(res, updated)
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const star = db.prepare('SELECT id FROM stars WHERE id = ?').get(id)
  if (!star) return fail(res, '明星不存在', 404)

  db.prepare('DELETE FROM stars WHERE id = ?').run(id)
  ok(res, { success: true })
})

export default router
