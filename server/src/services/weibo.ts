import { env } from '../config/env.js'

const API_BASE = 'https://api.weibo.com/2'
const OAUTH_BASE = 'https://api.weibo.com/oauth2'

export class WeiboApiError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.name = 'WeiboApiError'
    this.code = code
  }
}

interface WeiboErrorBody {
  error?: string
  error_code?: number
  error_description?: string
}

async function parseWeiboResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & WeiboErrorBody
  if (!res.ok || data.error || data.error_code) {
    throw new WeiboApiError(
      data.error_description || data.error || `微博 API 错误 (${res.status})`,
      data.error_code
    )
  }
  return data
}

export interface OAuthTokenResult {
  access_token: string
  expires_in: number
  uid: string
}

export async function exchangeOAuthCode(code: string): Promise<OAuthTokenResult> {
  const body = new URLSearchParams({
    client_id: env.weibo.appKey,
    client_secret: env.weibo.appSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.weibo.redirectUri,
  })

  const res = await fetch(`${OAUTH_BASE}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  return parseWeiboResponse<OAuthTokenResult>(res)
}

export interface WeiboStatus {
  id: string
  idstr: string
  text: string
  created_at: string
  comments_count: number
  thumbnail_pic?: string
  bmiddle_pic?: string
  original_pic?: string
  pic_urls?: Array<string | { thumbnail_pic?: string }>
  user?: { screen_name: string; avatar_hd?: string }
}

export async function getStatus(accessToken: string, id: string): Promise<WeiboStatus> {
  const url = new URL(`${API_BASE}/statuses/show.json`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('id', id)

  const res = await fetch(url)
  return parseWeiboResponse<WeiboStatus>(res)
}

export interface WeiboCommentRaw {
  id: number
  idstr?: string
  text: string
  created_at: string
  like_count?: number
  thumbnail_pic?: string
  user?: { screen_name: string }
}

export interface CommentsShowResult {
  comments: WeiboCommentRaw[]
  total_number?: number
}

export async function getComments(
  accessToken: string,
  weiboId: string,
  page = 1,
  count = 50
): Promise<CommentsShowResult> {
  const url = new URL(`${API_BASE}/comments/show.json`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('id', weiboId)
  url.searchParams.set('page', String(page))
  url.searchParams.set('count', String(count))

  const res = await fetch(url)
  return parseWeiboResponse<CommentsShowResult>(res)
}

export async function createComment(
  accessToken: string,
  weiboId: string,
  comment: string
): Promise<{ id?: number }> {
  const body = new URLSearchParams({
    access_token: accessToken,
    id: weiboId,
    comment,
    rip: env.weibo.serverIp,
  })

  const res = await fetch(`${API_BASE}/comments/create.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  return parseWeiboResponse<{ id?: number }>(res)
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(`${OAUTH_BASE}/authorize`)
  url.searchParams.set('client_id', env.weibo.appKey)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', env.weibo.redirectUri)
  url.searchParams.set('state', state)
  return url.toString()
}

export function extractStatusPics(status: WeiboStatus): string[] {
  const pics: string[] = []
  if (status.original_pic) pics.push(status.original_pic)
  if (status.bmiddle_pic && !pics.includes(status.bmiddle_pic)) pics.push(status.bmiddle_pic)
  if (status.thumbnail_pic && !pics.includes(status.thumbnail_pic)) pics.push(status.thumbnail_pic)

  for (const item of status.pic_urls || []) {
    if (typeof item === 'string') pics.push(item)
    else if (item.thumbnail_pic) pics.push(item.thumbnail_pic)
  }

  return pics
}

export function formatWeiboTime(raw: string): string {
  try {
    return new Date(raw).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return raw
  }
}

export function mapComment(item: WeiboCommentRaw, weiboId: string) {
  const commentId = item.idstr || String(item.id)
  return {
    id: commentId,
    content: item.text,
    userName: item.user?.screen_name || '匿名用户',
    createdAt: formatWeiboTime(item.created_at),
    likeCount: item.like_count || 0,
    hasImage: Boolean(item.thumbnail_pic) || /\[.*?\]/u.test(item.text),
    jumpUrl: `https://m.weibo.cn/detail/${weiboId}#comment_${commentId}`,
  }
}
