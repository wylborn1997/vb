import { Router } from 'express'
import { authMiddleware, fail, ok } from '../middleware/index.js'
import { getComments, createComment, mapComment, WeiboApiError } from '../services/weibo.js'
import { getUserWeiboAuth } from '../services/user-weibo.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  const weiboId = String(req.query.weiboId || '')
  const page = Number(req.query.page || 1)
  const keyword = String(req.query.keyword || '').trim().toLowerCase()

  if (!weiboId) return fail(res, '缺少 weiboId')

  const auth = getUserWeiboAuth(req.user!.userId)
  if (!auth) {
    return fail(res, '请先绑定微博账号', 401)
  }

  try {
    const result = await getComments(auth.accessToken, weiboId, page, 50)
    let list = (result.comments || []).map((item) => mapComment(item, weiboId))

    if (keyword) {
      list = list.filter(
        (item) =>
          item.content.toLowerCase().includes(keyword) ||
          item.userName.toLowerCase().includes(keyword)
      )
    }

    const hasMore = (result.comments || []).length >= 50
    ok(res, { list, hasMore })
  } catch (e) {
    const message = e instanceof WeiboApiError ? e.message : (e as Error).message
    if (message.includes('expired') || message.includes('过期')) {
      return fail(res, '微博授权已过期，请重新绑定', 401)
    }
    fail(res, message, 502)
  }
})

router.post('/send', authMiddleware, async (req, res) => {
  const { weiboId, content } = req.body as { weiboId?: string; content?: string }
  if (!weiboId || !content?.trim()) return fail(res, '缺少 weiboId 或 content')

  const auth = getUserWeiboAuth(req.user!.userId)
  if (!auth) {
    return fail(res, '请先绑定微博账号', 401)
  }

  try {
    await createComment(auth.accessToken, weiboId, content.trim())
    ok(res, { success: true })
  } catch (e) {
    const err = e instanceof WeiboApiError ? e : new Error((e as Error).message)
    const message = err.message

    if (message.includes('expired') || message.includes('过期')) {
      return fail(res, '微博授权已过期，请重新绑定', 401)
    }
    if (err instanceof WeiboApiError && err.code === 10017) {
      return fail(res, '评论太频繁，请稍后再试', 429)
    }
    fail(res, message || '评论发送失败', 502)
  }
})

export default router
