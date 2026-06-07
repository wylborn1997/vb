import { env } from '../config/env.js'

const API_BASE = 'https://api.weibo.com/2'
const MOBILE_API = 'https://m.weibo.cn/api/container/getIndex'

export interface MonitorPost {
  weiboId: string
  content: string
  publishTime: string
}

export function isMonitorConfigured(): boolean {
  return Boolean(env.weibo.monitorAccessToken || env.weibo.monitorCookie)
}

export function stripWeiboText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseWeiboTime(raw: string): string {
  try {
    return new Date(raw).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

async function fetchTimelineByToken(uid: string): Promise<MonitorPost[]> {
  const url = new URL(`${API_BASE}/statuses/user_timeline.json`)
  url.searchParams.set('access_token', env.weibo.monitorAccessToken)
  url.searchParams.set('uid', uid)
  url.searchParams.set('count', '10')

  const res = await fetch(url)
  const data = (await res.json()) as {
    statuses?: Array<{
      idstr?: string
      id?: number | string
      text?: string
      created_at?: string
    }>
    error?: string
    error_code?: number
  }

  if (!res.ok || data.error || data.error_code) {
    throw new Error(data.error || `微博 timeline 错误 (${res.status})`)
  }

  return (data.statuses || [])
    .map((item) => ({
      weiboId: item.idstr || String(item.id),
      content: stripWeiboText(item.text || ''),
      publishTime: parseWeiboTime(item.created_at || ''),
    }))
    .filter((item) => item.weiboId && item.content)
}

async function fetchTimelineByCookie(uid: string): Promise<MonitorPost[]> {
  const url = `${MOBILE_API}?type=uid&value=${encodeURIComponent(uid)}`
  const res = await fetch(url, {
    headers: {
      Cookie: env.weibo.monitorCookie,
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      Referer: `https://m.weibo.cn/u/${uid}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  const data = (await res.json()) as {
    ok?: number
    msg?: string
    data?: {
      cards?: Array<{
        card_type?: number
        mblog?: {
          id?: string
          mid?: string
          idstr?: string
          text?: string
          created_at?: string
        }
      }>
    }
  }

  if (data.ok !== 1) {
    throw new Error(data.msg || '微博 Cookie 监测失败，请检查 WEIBO_MONITOR_COOKIE')
  }

  const posts: MonitorPost[] = []
  for (const card of data.data?.cards || []) {
    if (card.card_type !== 9 || !card.mblog) continue
    const weiboId = card.mblog.idstr || card.mblog.id || card.mblog.mid
    if (!weiboId) continue
    posts.push({
      weiboId: String(weiboId),
      content: stripWeiboText(card.mblog.text || ''),
      publishTime: parseWeiboTime(card.mblog.created_at || ''),
    })
  }

  return posts
}

export async function fetchLatestPosts(uid: string): Promise<MonitorPost[]> {
  if (env.weibo.monitorAccessToken) {
    try {
      return await fetchTimelineByToken(uid)
    } catch (e) {
      if (!env.weibo.monitorCookie) throw e
      console.warn('[monitor] access_token 拉取失败，回退 Cookie:', (e as Error).message)
    }
  }

  if (env.weibo.monitorCookie) {
    return fetchTimelineByCookie(uid)
  }

  throw new Error('未配置 WEIBO_MONITOR_ACCESS_TOKEN 或 WEIBO_MONITOR_COOKIE')
}
