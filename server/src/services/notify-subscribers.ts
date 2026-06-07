import { db } from '../db/index.js'
import { env } from '../config/env.js'
import { sendSubscribeMessage, isWechatNotifyConfigured, WechatApiError } from './wechat.js'

export function getSubscribedOpenids(templateId: string): string[] {
  const rows = db
    .prepare(
      `SELECT DISTINCT u.openid
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE s.template_id = ?`
    )
    .all(templateId) as Array<{ openid: string }>

  return rows.map((row) => row.openid)
}

export function isUserSubscribed(userId: number, templateId: string): boolean {
  const row = db
    .prepare('SELECT 1 FROM subscriptions WHERE user_id = ? AND template_id = ?')
    .get(userId, templateId)
  return Boolean(row)
}

export function saveSubscription(userId: number, templateId: string) {
  db.prepare('INSERT OR IGNORE INTO subscriptions (user_id, template_id) VALUES (?, ?)').run(
    userId,
    templateId
  )
}

export async function notifyNewWeiboPost(params: {
  starNickname: string
  weiboId: string
  content: string
  publishTime: string
}) {
  if (!isWechatNotifyConfigured()) {
    console.log('[notify] 未配置微信订阅消息，跳过推送')
    return { sent: 0, skipped: 0, failed: 0 }
  }

  const openids = getSubscribedOpenids(env.wechat.subscribeTemplateId)
  if (openids.length === 0) {
    console.log('[notify] 暂无订阅用户')
    return { sent: 0, skipped: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const openid of openids) {
    try {
      await sendSubscribeMessage(openid, {
        starName: params.starNickname,
        content: params.content,
        publishTime: params.publishTime,
        weiboId: params.weiboId,
      })
      sent += 1
    } catch (e) {
      failed += 1
      const err = e as WechatApiError
      // 43101: 用户未订阅或次数用完，静默跳过
      if (err.errcode === 43101) {
        console.log(`[notify] 用户 ${openid} 无可用订阅次数`)
      } else {
        console.warn(`[notify] 推送失败 ${openid}:`, err.message)
      }
    }
  }

  console.log(`[notify] 新博 ${params.weiboId} 推送完成：成功 ${sent}，失败 ${failed}`)
  return { sent, skipped: 0, failed }
}
