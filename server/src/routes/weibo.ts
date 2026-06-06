import { Router } from 'express'
import { db } from '../db/index.js'
import { fail, ok } from '../middleware/index.js'

const router = Router()

router.get('/:id', (req, res) => {
  const post = db
    .prepare(
      `SELECT p.weibo_id as id, p.content, p.publish_time as publishTime,
              s.nickname, s.avatar
       FROM weibo_posts p
       JOIN stars s ON s.id = p.star_id
       WHERE p.weibo_id = ?`
    )
    .get(req.params.id) as Record<string, unknown> | undefined

  if (!post) {
    return ok(res, {
      id: req.params.id,
      content: '（示例）微博详情将在接入微博 API 后展示',
      publishTime: new Date().toISOString(),
      pics: [],
      commentsCount: 0,
    })
  }

  ok(res, {
    id: post.id,
    content: post.content,
    publishTime: post.publishTime,
    pics: [],
    commentsCount: 0,
    star: { nickname: post.nickname, avatar: post.avatar },
  })
})

export default router
