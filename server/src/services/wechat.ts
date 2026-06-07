import { env } from '../config/env.js'

const CODE2SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session'

const WECHAT_ERROR_MESSAGES: Record<number, string> = {
  [-1]: '微信服务繁忙，请稍后再试',
  40029: '登录凭证无效，请重试',
  40125: '小程序配置无效，请检查 AppSecret',
  40163: '登录凭证已失效，请重新登录',
  40226: '账号存在风险，登录被拦截',
  45011: '登录太频繁，请稍后再试',
}

export class WechatApiError extends Error {
  errcode?: number
  constructor(message: string, errcode?: number) {
    super(message)
    this.name = 'WechatApiError'
    this.errcode = errcode
  }
}

interface Code2SessionResult {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

export function isWechatConfigured(): boolean {
  return Boolean(env.wechat.appId && env.wechat.secret)
}

export async function code2Session(code: string): Promise<{ openid: string; unionid?: string }> {
  const url = new URL(CODE2SESSION_URL)
  url.searchParams.set('appid', env.wechat.appId)
  url.searchParams.set('secret', env.wechat.secret)
  url.searchParams.set('js_code', code)
  url.searchParams.set('grant_type', 'authorization_code')

  const res = await fetch(url)
  const data = (await res.json()) as Code2SessionResult

  if (data.errcode || !data.openid) {
    const message =
      (data.errcode !== undefined && WECHAT_ERROR_MESSAGES[data.errcode]) ||
      data.errmsg ||
      '微信登录失败'
    throw new WechatApiError(message, data.errcode)
  }

  return { openid: data.openid, unionid: data.unionid }
}

export function mockOpenid(code: string): string {
  return `mock_openid_${code.slice(0, 8)}`
}

const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token'
const SUBSCRIBE_SEND_URL = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send'

let accessTokenCache: { token: string; expiresAt: number } | null = null

export function isWechatNotifyConfigured(): boolean {
  return Boolean(isWechatConfigured() && env.wechat.subscribeTemplateId)
}

export async function getMiniProgramAccessToken(): Promise<string> {
  if (!isWechatConfigured()) {
    throw new WechatApiError('未配置 WECHAT_APPID / WECHAT_SECRET')
  }

  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.token
  }

  const url = new URL(TOKEN_URL)
  url.searchParams.set('grant_type', 'client_credential')
  url.searchParams.set('appid', env.wechat.appId)
  url.searchParams.set('secret', env.wechat.secret)

  const res = await fetch(url)
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
    errcode?: number
    errmsg?: string
  }

  if (!data.access_token) {
    throw new WechatApiError(data.errmsg || '获取微信 access_token 失败', data.errcode)
  }

  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 7200) * 1000,
  }

  return data.access_token
}

export interface SubscribeMessagePayload {
  starName: string
  content: string
  publishTime: string
  weiboId: string
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

function formatDisplayTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

export async function sendSubscribeMessage(openid: string, payload: SubscribeMessagePayload) {
  if (!env.wechat.subscribeTemplateId) {
    throw new WechatApiError('未配置 WECHAT_SUBSCRIBE_TEMPLATE_ID')
  }

  const accessToken = await getMiniProgramAccessToken()
  const url = `${SUBSCRIBE_SEND_URL}?access_token=${accessToken}`

  const data: Record<string, { value: string }> = {
    [env.wechat.subscribeFieldStar]: { value: truncate(payload.starName, 20) },
    [env.wechat.subscribeFieldContent]: { value: truncate(payload.content, 20) },
    [env.wechat.subscribeFieldTime]: { value: truncate(formatDisplayTime(payload.publishTime), 20) },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      touser: openid,
      template_id: env.wechat.subscribeTemplateId,
      page: `pages/weibo/detail?id=${payload.weiboId}`,
      miniprogram_state: env.nodeEnv === 'production' ? 'formal' : 'developer',
      lang: 'zh_CN',
      data,
    }),
  })

  const body = (await res.json()) as { errcode?: number; errmsg?: string }
  if (body.errcode && body.errcode !== 0) {
    throw new WechatApiError(body.errmsg || '订阅消息发送失败', body.errcode)
  }
}
