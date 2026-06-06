import cron from 'node-cron'
import { db } from '../db/index.js'
import { env } from '../config/env.js'

/**
 * 定时监测明星发博（Phase 3 完善）
 * 当前为占位：每 5 分钟检查一次，后续接入 user_timeline 或爬虫
 */
export function startMonitorJob() {
  cron.schedule('*/5 * * * *', () => {
    if (!env.weibo.monitorCookie) {
      console.log('[monitor] 未配置 WEIBO_MONITOR_COOKIE，跳过监测')
      return
    }

    const stars = db.prepare('SELECT id, user_id, nickname FROM stars WHERE enabled = 1').all() as Array<{
      id: number
      user_id: string
      nickname: string
    }>

    console.log(`[monitor] 检查 ${stars.length} 位明星的新微博...`)
    // TODO: 拉取 timeline，对比 weibo_posts，新博入库并推送订阅消息
  })

  console.log('[monitor] 发博监测任务已启动（每 5 分钟）')
}
