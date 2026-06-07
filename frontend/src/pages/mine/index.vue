<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { authApi, notifyApi } from '@/api/modules'
import PageHeader from '@/components/PageHeader.vue'
import { showLoginError } from '@/utils/dev-hints'

const userStore = useUserStore()
const subscribeTemplateId = ref<string | null>(null)
const notifyConfigured = ref(false)

onShow(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
    try {
      const config = await notifyApi.getConfig()
      subscribeTemplateId.value = config.templateId
      notifyConfigured.value = config.notifyConfigured
      userStore.subscribed = config.subscribed
    } catch {
      // ignore
    }
  }
})

async function bindWeibo() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先微信登录', icon: 'none' })
    return
  }
  try {
    const { url } = await authApi.getWeiboAuthUrl()
    uni.navigateTo({ url: `/pages/auth/weibo?url=${encodeURIComponent(url)}` })
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '获取授权链接失败', icon: 'none' })
  }
}

async function unbindWeibo() {
  uni.showModal({
    title: '解绑微博',
    content: '解绑后将无法发评论和加载评论，确定解绑吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await userStore.unbindWeibo()
        uni.showToast({ title: '已解绑', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: (e as Error).message || '解绑失败', icon: 'none' })
      }
    },
  })
}

async function requestSubscribe() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先微信登录', icon: 'none' })
    return
  }
  if (!subscribeTemplateId.value) {
    uni.showToast({ title: '服务端未配置订阅模板', icon: 'none' })
    return
  }

  uni.requestSubscribeMessage({
    tmplIds: [subscribeTemplateId.value],
    success: async (res) => {
      const accepted = res[subscribeTemplateId.value!]
      if (accepted !== 'accept') {
        uni.showToast({ title: '未授权订阅', icon: 'none' })
        return
      }
      try {
        await notifyApi.subscribe([subscribeTemplateId.value!])
        userStore.subscribed = true
        uni.showToast({ title: '订阅成功 🎉', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: (e as Error).message || '记录订阅失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '订阅失败', icon: 'none' })
    },
  })
}

async function handleLogin() {
  try {
    await userStore.loginWithWechat()
    uni.showToast({ title: '登录成功 🎉', icon: 'success' })
  } catch (e) {
    showLoginError(e)
  }
}

function goAdmin() {
  uni.navigateTo({ url: '/pages/admin/settings' })
}
</script>

<template>
  <view class="page-container">
    <PageHeader emoji="🧸" title="我的" subtitle="账号设置与提醒管理" />

    <view class="card card-cute">
      <view class="card-inner">
        <text class="section-label">👤 账号</text>
        <view v-if="!userStore.isLoggedIn" class="btn-primary mb-3" @tap="handleLogin">
          微信登录
        </view>
        <view v-else class="login-banner mb-3">
          <text class="text-body-sm text-block">✅ 已登录</text>
          <text v-if="userStore.weiboBound" class="text-caption text-block">
            微博已绑定 · UID {{ userStore.weiboUid }}
          </text>
          <text v-else class="text-caption text-block">微博未绑定</text>
        </view>

        <view class="btn-secondary" @tap="bindWeibo">
          {{ userStore.weiboBound ? '重新绑定微博' : '🔗 绑定微博账号' }}
        </view>
        <view
          v-if="userStore.weiboBound"
          class="btn-ghost text-center mb-3"
          @tap="unbindWeibo"
        >
          解绑微博
        </view>
        <view class="btn-secondary mb-0" @tap="requestSubscribe">
          {{ userStore.subscribed ? '🔔 已订阅发博提醒' : '🔔 开启发博提醒' }}
        </view>
        <text v-if="userStore.isLoggedIn && !notifyConfigured" class="text-caption text-block mt-2">
          服务端尚未配置 WECHAT_SUBSCRIBE_TEMPLATE_ID
        </text>
      </view>
    </view>

    <view class="card">
      <text class="section-label">⚙️ 管理</text>
      <view class="menu-item" @tap="goAdmin">
        <text>明星配置 · 监测设置</text>
        <text class="link-arrow">›</text>
      </view>
    </view>

    <view v-if="userStore.isLoggedIn" class="logout-text" @tap="userStore.logout">
      退出登录
    </view>
  </view>
</template>
