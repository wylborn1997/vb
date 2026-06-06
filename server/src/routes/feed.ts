import { Router } from 'express'
import { db } from '../db/index.js'
import { ok } from '../middleware/index.js'

const router = Router()

router.get('/latest', (_req, res) => {
  const feeds = db
    .prepare(
      `SELECT p.id, p.star_id as starId, p.weibo_id as weiboId, p.content, p.publish_time as publishTime,
              s.nickname, s.avatar, s.user_id as starUserId
       FROM weibo_posts p
       JOIN stars s ON s.id = p.star_id
       ORDER BY p.publish_time DESC
       LIMIT 20`
    )
    .all()
    .map((row) => {
      const r = row as Record<string, unknown>
      return {
        id: r.id,
        starId: r.starId,
        weiboId: r.weiboId,
        content: r.content,
        publishTime: r.publishTime,
        star: {
          userId: r.starUserId,
          nickname: r.nickname,
          avatar: r.avatar,
        },
      }
    })

  ok(res, feeds)
})

export default router
