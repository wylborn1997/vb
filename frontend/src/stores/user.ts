import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules'
import { STORAGE_KEYS } from '@/utils/constants'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync(STORAGE_KEYS.TOKEN) || '')
  const weiboBound = ref(false)
  const weiboUid = ref('')
  const weiboTokenExpiresAt = ref<string | null>(null)
  const subscribed = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function loginWithWechat() {
    const loginRes = await uni.login({ provider: 'weixin' })
    const code = loginRes.code
    if (!code) throw new Error('微信登录失败')
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
