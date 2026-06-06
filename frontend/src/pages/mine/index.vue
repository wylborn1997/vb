<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules'

const userStore = useUserStore()

async function bindWeibo() {
  try {
    const { url } = await authApi.getWeiboAuthUrl()
    uni.navigateTo({ url: `/pages/auth/weibo?url=${encodeURIComponent(url)}` })
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '获取授权链接失败', icon: 'none' })
  }
}

async function requestSubscribe() {
  // TODO: 替换为微信公众平台申请的订阅消息模板 ID
  uni.requestSubscribeMessage({
    tmplIds: ['YOUR_TEMPLATE_ID'],
    success: () => {
      userStore.subscribed = true
      uni.showToast({ title: '订阅成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '订阅失败', icon: 'none' })
    },
  })
}

async function handleLogin() {
  try {
    await userStore.loginWithWechat()
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '登录失败', icon: 'none' })
  }
}

function goAdmin() {
  uni.navigateTo({ url: '/pages/admin/settings' })
}
</script>

<template>
  <view class="page-container">
    <view class="card mb-4">
      <text class="mb-3 block text-lg font-bold text-white">账号</text>
      <view v-if="!userStore.isLoggedIn" class="btn-primary mb-3" @tap="handleLogin">微信登录</view>
      <view v-else class="mb-3 text-sm text-white/60">已登录</view>

      <view class="btn-secondary mb-3" @tap="bindWeibo">
        {{ userStore.weiboBound ? '重新绑定微博' : '绑定微博账号' }}
      </view>
      <view class="btn-secondary" @tap="requestSubscribe">开启发博提醒</view>
    </view>

    <view class="card mb-4">
      <text class="mb-3 block text-sm font-medium text-white">管理</text>
      <view class="py-2 text-sm text-white/70" @tap="goAdmin">明星配置 · 监测设置</view>
    </view>

    <view v-if="userStore.isLoggedIn" class="text-center text-xs text-white/30" @tap="userStore.logout">
      退出登录
    </view>
  </view>
</template>
