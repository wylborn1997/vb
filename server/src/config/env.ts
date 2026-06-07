import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  adminOpenids: (process.env.ADMIN_OPENIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    subscribeTemplateId: process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '',
    subscribeFieldStar: process.env.WECHAT_SUBSCRIBE_FIELD_STAR || 'thing1',
    subscribeFieldContent: process.env.WECHAT_SUBSCRIBE_FIELD_CONTENT || 'thing2',
    subscribeFieldTime: process.env.WECHAT_SUBSCRIBE_FIELD_TIME || 'time3',
  },
  weibo: {
    appKey: process.env.WEIBO_APP_KEY || '',
    appSecret: process.env.WEIBO_APP_SECRET || '',
    redirectUri: process.env.WEIBO_REDIRECT_URI || 'http://localhost:3000/auth/weibo/callback',
    monitorCookie: process.env.WEIBO_MONITOR_COOKIE || '',
    monitorAccessToken: process.env.WEIBO_MONITOR_ACCESS_TOKEN || '',
    serverIp: process.env.WEIBO_SERVER_IP || '127.0.0.1',
  },
  databasePath: process.env.DATABASE_PATH || './data/vb.db',
}
