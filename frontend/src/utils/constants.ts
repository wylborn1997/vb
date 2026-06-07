// 微信小程序模拟器访问本地后端，127.0.0.1 比 localhost 更稳定
const defaultUrl =
  typeof process !== 'undefined' && process.env?.UNI_PLATFORM === 'mp-weixin'
    ? 'http://127.0.0.1:3000'
    : 'http://localhost:3000'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultUrl

export const STORAGE_KEYS = {
  TOKEN: 'vb_token',
} as const
