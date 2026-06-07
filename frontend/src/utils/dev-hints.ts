import { API_BASE_URL } from '@/utils/constants'

export function isDomainListError(message: string): boolean {
  return /url not in domain list|不在以下 request 合法域名/i.test(message)
}

export function isConnectionError(message: string): boolean {
  return /cronet_error_code:-102|errcode:\s*-102|ECONNREFUSED|connect fail|无法连接后端/i.test(
    message
  )
}

export function showDomainListHelp() {
  uni.showModal({
    title: '真机无法访问本地后端',
    content: `当前 API：${API_BASE_URL}

• 扫码「预览」：真机强制校验域名，127.0.0.1 不可用
• 请改用「真机调试」（非预览），并在详情→本地设置勾选不校验合法域名
• 真机调试时 API 需改为电脑局域网 IP，例如 http://192.168.x.x:3000
• 若必须用「预览」，需 HTTPS 域名并在公众平台配置 request 合法域名`,
    showCancel: false,
    confirmText: '知道了',
  })
}

export function showConnectionHelp() {
  uni.showModal({
    title: '无法连接后端 (-102)',
    content: `当前 API：${API_BASE_URL}

1. 真机不能用 127.0.0.1，需电脑局域网 IP
2. 在项目 frontend 目录执行：
   npm run build:mp-weixin:lan
3. 手机与电脑同一 WiFi，浏览器访问
   http://电脑IP:3000/health 应显示 ok
4. 开发者工具重新「真机调试」编译`,
    showCancel: false,
    confirmText: '知道了',
  })
}

export function showLoginError(err: unknown) {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '登录失败'

  if (isDomainListError(message)) {
    showDomainListHelp()
    return
  }

  if (isConnectionError(message)) {
    showConnectionHelp()
    return
  }

  uni.showToast({ title: message, icon: 'none', duration: 3000 })
}
