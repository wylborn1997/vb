import { Router } from 'express'
import { fail, ok } from '../middleware/index.js'

const router = Router()

router.get('/', (req, res) => {
  const weiboId = String(req.query.weiboId || '')
  const page = Number(req.query.page || 1)
  const keyword = String(req.query.keyword || '').trim()

  if (!weiboId) return fail(res, '缺少 weiboId')

  // TODO: 调用微博 comments/show API
  const mockList = [
    {
      id: 'c001',
      content: keyword ? `包含「${keyword}」的示例评论` : '示例评论：应援口号在这里',
      userName: '粉丝A',
      createdAt: '2026-06-06 12:00',
      likeCount: 12,
      hasImage: false,
      jumpUrl: `https://m.weibo.cn/detail/${weiboId}`,
    },
  ]

  ok(res, { list: mockList, hasMore: page < 3 })
})

router.post('/send', (req, res) => {
  const { weiboId, content } = req.body as { weiboId?: string; content?: string }
  if (!weiboId || !content?.trim()) return fail(res, '缺少 weiboId 或 content')

  // TODO: 使用用户 OAuth token 调用 comments/create
  ok(res, { success: true })
})

export default router
