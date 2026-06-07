import { Router } from 'express'
import { db } from '../db/index.js'
import { fail, ok, optionalAuthMiddleware } from '../middleware/index.js'
import { formatWeiboTime, getStatus, extractStatusPics, WeiboApiError } from '../services/weibo.js'
import { getUserWeiboAuth } from '../services/user-weibo.js'

const router = Router()

router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  const weiboId = req.params.id

  const post = db
    .prepare(
      `SELECT p.weibo_id as id, p.content, p.publish_time as publishTime,
              s.nickname, s.avatar
       FROM weibo_posts p
       JOIN stars s ON s.id = p.star_id
       WHERE p.weibo_id = ?`
    )
    .get(weiboId) as Record<string, unknown> | undefined

  const auth = req.user ? getUserWeiboAuth(req.user.userId) : null

  if (auth) {
    try {
      const status = await getStatus(auth.accessToken, weiboId)
      const pics = extractStatusPics(status)

      return ok(res, {
        id: status.idstr || String(status.id),
        content: status.text,
        publishTime: formatWeiboTime(status.created_at),
        pics,
        commentsCount: status.comments_count || 0,
        star: post
          ? { nickname: post.nickname, avatar: post.avatar }
          : status.user
            ? { nickname: status.user.screen_name, avatar: status.user.avatar_hd || '' }
            : undefined,
      })
    } catch (e) {
      if (!post) {
        const message = e instanceof WeiboApiError ? e.message : (e as Error).message
        return fail(res, message, 502)
      }
    }
  }

  if (post) {
    return ok(res, {
      id: post.id,
      content: post.content,
      publishTime: post.publishTime,
      pics: [],
      commentsCount: 0,
      star: { nickname: post.nickname, avatar: post.avatar },
    })
  }

  if (!auth) {
    return fail(res, '请先绑定微博账号以查看微博详情', 401)
  }

  return fail(res, '未找到该微博', 404)
})

export default router
