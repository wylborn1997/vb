import { Router } from 'express'
import { db } from '../db/index.js'
import { fail, ok } from '../middleware/index.js'

const router = Router()

router.get('/', (_req, res) => {
  const list = db
    .prepare('SELECT id, title, content, category FROM templates ORDER BY id DESC')
    .all()
  ok(res, list)
})

router.post('/', (req, res) => {
  const { title, content, category = 'default' } = req.body as {
    title?: string
    content?: string
    category?: string
  }
  if (!title || !content) return fail(res, '缺少 title 或 content')

  const result = db
    .prepare('INSERT INTO templates (title, content, category) VALUES (?, ?, ?)')
    .run(title, content, category)

  ok(res, { id: Number(result.lastInsertRowid), title, content, category })
})

router.put('/:id', (req, res) => {
  const { title, content, category } = req.body as {
    title?: string
    content?: string
    category?: string
  }
  db.prepare(
    'UPDATE templates SET title = COALESCE(?, title), content = COALESCE(?, content), category = COALESCE(?, category) WHERE id = ?'
  ).run(title ?? null, content ?? null, category ?? null, req.params.id)
  ok(res, { id: Number(req.params.id), title, content, category })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id)
  ok(res, null)
})

export default router
