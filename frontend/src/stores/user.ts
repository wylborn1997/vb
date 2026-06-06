import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules'
import { STORAGE_KEYS } from '@/utils/constants'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync(STORAGE_KEYS.TOKEN) || '')
  const weiboBound = ref(false)
  const subscribed = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function loginWithWechat() {
    const { code } = await uni.login({ provider: 'weixin' })
    if (!code) throw new Error('微信登录失败')
    const res = await authApi.wechatLogin(code)
    token.value = res.token
    uni.setStorageSync(STORAGE_KEYS.TOKEN, res.token)
  }

  function logout() {
    token.value = ''
    weiboBound.value = false
    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
  }

  return {
    token,
    weiboBound,
    subscribed,
    isLoggedIn,
    loginWithWechat,
    logout,
  }
})
