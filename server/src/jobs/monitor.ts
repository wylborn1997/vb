import cron from 'node-cron'
import { db } from '../db/index.js'
import { fetchLatestPosts, isMonitorConfigured } from '../services/weibo-monitor.js'
import {
  getMonitorLastRunAt,
  isMonitorEnabled,
  setMonitorLastRunAt,
} from '../services/settings.js'
import { notifyNewWeiboPost } from '../services/notify-subscribers.js'

let running = false

export async function runMonitorCheck() {
  if (running) {
    console.log('[monitor] 上一次任务仍在执行，跳过')
    return
  }

  if (!isMonitorEnabled()) {
    console.log('[monitor] 监测已关闭，跳过')
    return
  }

  if (!isMonitorConfigured()) {
    console.log('[monitor] 未配置 WEIBO_MONITOR_ACCESS_TOKEN / WEIBO_MONITOR_COOKIE，跳过')
    return
  }

  running = true
  const startedAt = new Date().toISOString()

  try {
    const stars = db
      .prepare('SELECT id, user_id, nickname FROM stars WHERE enabled = 1')
      .all() as Array<{ id: number; user_id: string; nickname: string }>

    console.log(`[monitor] 开始检查 ${stars.length} 位明星的新微博...`)

    let newCount = 0

    for (const star of stars) {
      try {
        const posts = await fetchLatestPosts(star.user_id)
        for (const post of posts) {
          const exists = db
            .prepare('SELECT 1 FROM weibo_posts WHERE weibo_id = ?')
            .get(post.weiboId)

          if (exists) continue

          db.prepare(
            'INSERT INTO weibo_posts (star_id, weibo_id, content, publish_time) VALUES (?, ?, ?, ?)'
          ).run(star.id, post.weiboId, post.content, post.publishTime)

          newCount += 1
          await notifyNewWeiboPost({
            starNickname: star.nickname,
            weiboId: post.weiboId,
            content: post.content,
            publishTime: post.publishTime,
          })
        }
      } catch (e) {
        console.warn(`[monitor] 明星 ${star.nickname}(${star.user_id}) 检查失败:`, (e as Error).message)
      }
    }

    setMonitorLastRunAt(startedAt)
    console.log(`[monitor] 本轮完成，新增 ${newCount} 条微博`)
  } finally {
    running = false
  }
}

export function getMonitorStatus() {
  return {
    enabled: isMonitorEnabled(),
    configured: isMonitorConfigured(),
    lastRunAt: getMonitorLastRunAt(),
    running,
  }
}

export function startMonitorJob() {
  cron.schedule('*/5 * * * *', () => {
    runMonitorCheck().catch((e) => {
      console.error('[monitor] 任务异常:', e)
    })
  })

  console.log('[monitor] 发博监测任务已启动（每 5 分钟）')
}
