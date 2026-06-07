import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules'
import { STORAGE_KEYS } from '@/utils/constants'

function normalizeLoginError(err: unknown, fallback: string): string {
  if (typeof err === 'string') return err
  if (err instanceof Error && err.message) return err.message
  const raw = err as { errMsg?: string; message?: string }
  return raw?.errMsg || raw?.message || fallback
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync(STORAGE_KEYS.TOKEN) || '')
  const weiboBound = ref(false)
  const weiboUid = ref('')
  const weiboTokenExpiresAt = ref<string | null>(null)
  const subscribed = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function loginWithWechat() {
    let loginRes: UniApp.LoginRes
    try {
      loginRes = await uni.login()
    } catch (e) {
      throw new Error(
        normalizeLoginError(e, '微信 login 调用失败，请确认 manifest.json 已填写小程序 AppID')
      )
    }

    const code = loginRes?.code
    if (!code) {
      throw new Error('未获取到微信 code，请在开发者工具填写 AppID 或使用真机调试')
    }

    const res = await authApi.wechatLogin(code)
    token.value = res.token
    uni.setStorageSync(STORAGE_KEYS.TOKEN, res.token)
    await fetchProfile()
  }

  async function fetchProfile() {
    if (!token.value) {
      weiboBound.value = false
      weiboUid.value = ''
      weiboTokenExpiresAt.value = null
      return
    }
    try {
      const profile = await authApi.getProfile()
      weiboBound.value = profile.weiboBound
      weiboUid.value = profile.weiboUid
      weiboTokenExpiresAt.value = profile.weiboTokenExpiresAt
    } catch {
      weiboBound.value = false
    }
  }

  async function unbindWeibo() {
    await authApi.unbindWeibo()
    weiboBound.value = false
    weiboUid.value = ''
    weiboTokenExpiresAt.value = null
  }

  function logout() {
    token.value = ''
    weiboBound.value = false
    weiboUid.value = ''
    weiboTokenExpiresAt.value = null
    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
  }

  return {
    token,
    weiboBound,
    weiboUid,
    weiboTokenExpiresAt,
    subscribed,
    isLoggedIn,
    loginWithWechat,
    fetchProfile,
    unbindWeibo,
    logout,
  }
})
