import { Router } from 'express'
import { db } from '../db/index.js'
import { env } from '../config/env.js'
import {
  authMiddleware,
  fail,
  ok,
  signToken,
  signWeiboOAuthState,
  verifyWeiboOAuthState,
} from '../middleware/index.js'
import { buildAuthorizeUrl, exchangeOAuthCode, WeiboApiError } from '../services/weibo.js'
import { code2Session, isWechatConfigured, mockOpenid, WechatApiError } from '../services/wechat.js'
import {
  clearUserWeiboToken,
  getUserProfile,
  saveUserWeiboToken,
} from '../services/user-weibo.js'

const router = Router()

router.post('/wechat', async (req, res) => {
  const { code } = req.body as { code?: string }
  if (!code) return fail(res, '缺少 code')

  try {
    let openid: string
    if (isWechatConfigured()) {
      const session = await code2Session(code)
      openid = session.openid
    } else {
      openid = mockOpenid(code)
    }

    let user = db.prepare('SELECT id, openid FROM users WHERE openid = ?').get(openid) as
      | { id: number; openid: string }
      | undefined

    if (!user) {
      const result = db.prepare('INSERT INTO users (openid) VALUES (?)').run(openid)
      user = { id: Number(result.lastInsertRowid), openid }
    }

    const token = signToken({ userId: user.id, openid: user.openid })
    ok(res, { token })
  } catch (e) {
    const message = e instanceof WechatApiError ? e.message : (e as Error).message
    fail(res, message, 502)
  }
})

router.get('/me', authMiddleware, (req, res) => {
  const profile = getUserProfile(req.user!.userId)
  if (!profile) return fail(res, '用户不存在', 404)
  ok(res, profile)
})

router.get('/weibo/url', authMiddleware, (req, res) => {
  if (!env.weibo.appKey || !env.weibo.appSecret) {
    return fail(res, '请先在 server/.env 配置 WEIBO_APP_KEY 和 WEIBO_APP_SECRET')
  }

  const state = signWeiboOAuthState(req.user!.userId)
  ok(res, { url: buildAuthorizeUrl(state) })
})

router.get('/weibo/callback', async (req, res) => {
  const code = req.query.code as string | undefined
  const state = req.query.state as string | undefined
  const error = req.query.error as string | undefined

  if (error) {
    return res.status(400).send(renderCallbackPage('授权已取消', false))
  }
  if (!code || !state) {
    return res.status(400).send(renderCallbackPage('授权失败：缺少 code 或 state', false))
  }

  try {
    const userId = verifyWeiboOAuthState(state)
    const tokenResult = await exchangeOAuthCode(code)
    saveUserWeiboToken(userId, tokenResult.uid, tokenResult.access_token, tokenResult.expires_in)
    res.send(renderCallbackPage('微博绑定成功！请返回小程序继续使用～', true))
  } catch (e) {
    const message = e instanceof WeiboApiError ? e.message : (e as Error).message
    res.status(400).send(renderCallbackPage(`绑定失败：${message}`, false))
  }
})

router.post('/weibo/unbind', authMiddleware, (req, res) => {
  clearUserWeiboToken(req.user!.userId)
  ok(res, { success: true })
})

function renderCallbackPage(message: string, success: boolean) {
  const color = success ? '#FF6B9D' : '#A88888'
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>微博绑定</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: linear-gradient(180deg,#fff5f8,#fff0eb);
      display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
    .card { background:#fff; border-radius:20px; padding:32px 24px; text-align:center;
      box-shadow:0 8px 32px rgba(255,107,157,.15); max-width:320px; }
    h3 { color:${color}; margin:0 0 12px; font-size:20px; }
    p { color:#6b4f4f; font-size:14px; line-height:1.6; margin:0; }
  </style>
</head>
<body>
  <div class="card">
    <h3>${success ? '绑定成功 🎉' : '绑定失败'}</h3>
    <p>${message}</p>
  </div>
</body>
</html>`
}

export default router
