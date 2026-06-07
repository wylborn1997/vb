import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  auth?: boolean
}

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface UniRequestFailError {
  errMsg?: string
  message?: string
}

function normalizeRequestError(err: unknown, fallback = '请求失败'): Error {
  if (err instanceof Error && err.message) return err
  if (typeof err === 'string') return new Error(err)
  const raw = err as UniRequestFailError
  const message = raw?.errMsg || raw?.message || fallback
  return new Error(message)
}

export function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true } = options
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token) header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header,
      success: (res) => {
        const body = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        reject(new Error(body?.message || `请求失败 (${res.statusCode})`))
      },
      fail: (err) => reject(normalizeRequestError(err, `无法连接后端 ${API_BASE_URL}`)),
    })
  })
}
