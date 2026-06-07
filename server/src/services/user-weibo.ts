import { db } from '../db/index.js'

export interface UserWeiboAuth {
  userId: number
  accessToken: string
  weiboUid: string
  expiresAt: Date | null
}

export function getUserWeiboAuth(userId: number): UserWeiboAuth | null {
  const row = db
    .prepare(
      'SELECT id, weibo_uid, weibo_token, weibo_token_expires_at FROM users WHERE id = ?'
    )
    .get(userId) as
    | {
        id: number
        weibo_uid: string | null
        weibo_token: string | null
        weibo_token_expires_at: string | null
      }
    | undefined

  if (!row?.weibo_token) return null

  const expiresAt = row.weibo_token_expires_at ? new Date(row.weibo_token_expires_at) : null
  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return null
  }

  return {
    userId: row.id,
    accessToken: row.weibo_token,
    weiboUid: row.weibo_uid || '',
    expiresAt,
  }
}

export function saveUserWeiboToken(userId: number, uid: string, accessToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  db.prepare(
    'UPDATE users SET weibo_uid = ?, weibo_token = ?, weibo_token_expires_at = ? WHERE id = ?'
  ).run(uid, accessToken, expiresAt, userId)
}

export function clearUserWeiboToken(userId: number) {
  db.prepare(
    'UPDATE users SET weibo_uid = NULL, weibo_token = NULL, weibo_token_expires_at = NULL WHERE id = ?'
  ).run(userId)
}

export function getUserProfile(userId: number) {
  const row = db
    .prepare('SELECT id, openid, weibo_uid, weibo_token_expires_at FROM users WHERE id = ?')
    .get(userId) as
    | {
        id: number
        openid: string
        weibo_uid: string | null
        weibo_token_expires_at: string | null
      }
    | undefined

  if (!row) return null

  const auth = getUserWeiboAuth(userId)
  return {
    userId: row.id,
    openid: row.openid,
    weiboBound: Boolean(auth),
    weiboUid: row.weibo_uid || '',
    weiboTokenExpiresAt: row.weibo_token_expires_at,
  }
}
