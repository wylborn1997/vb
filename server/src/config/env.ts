import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    subscribeTemplateId: process.env.WECHAT_SUBSCRIBE_TEMPLATE_ID || '',
  },
  weibo: {
    appKey: process.env.WEIBO_APP_KEY || '',
    appSecret: process.env.WEIBO_APP_SECRET || '',
    redirectUri: process.env.WEIBO_REDIRECT_URI || 'http://localhost:3000/auth/weibo/callback',
    monitorCookie: process.env.WEIBO_MONITOR_COOKIE || '',
  },
  databasePath: process.env.DATABASE_PATH || './data/vb.db',
}
