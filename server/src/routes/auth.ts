import { Router } from 'express'
import { db } from '../db/index.js'
import { env } from '../config/env.js'
import { fail, ok, signToken } from '../middleware/index.js'

const router = Router()

router.post('/wechat', (req, res) => {
  const { code } = req.body as { code?: string }
  if (!code) return fail(res, '缺少 code')

  // TODO: 调用微信 jscode2session 换取 openid
  const openid = `mock_openid_${code.slice(0, 8)}`

  let user = db.prepare('SELECT id, openid FROM users WHERE openid = ?').get(openid) as
    | { id: number; openid: string }
    | undefined

  if (!user) {
    const result = db.prepare('INSERT INTO users (openid) VALUES (?)').run(openid)
    user = { id: Number(result.lastInsertRowid), openid }
  }

  const token = signToken({ userId: user.id, openid: user.openid })
  ok(res, { token })
})

router.get('/weibo/url', (_req, res) => {
  if (!env.weibo.appKey) {
    return fail(res, '请配置 WEIBO_APP_KEY')
  }
  const url =
    `https://api.weibo.com/oauth2/authorize?client_id=${env.weibo.appKey}` +
    `&response_type=code&redirect_uri=${encodeURIComponent(env.weibo.redirectUri)}`
  ok(res, { url })
})

router.get('/weibo/callback', async (req, res) => {
  const code = req.query.code as string | undefined
  if (!code) return res.status(400).send('授权失败：缺少 code')

  // TODO: 用 code 换 access_token，关联当前用户（需 state 参数传递 userId）
  res.send('<html><body><h3>微博绑定成功，请返回小程序</h3></body></html>')
})

export default router
