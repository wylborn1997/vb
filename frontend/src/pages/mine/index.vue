<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules'
import PageHeader from '@/components/PageHeader.vue'

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
  uni.requestSubscribeMessage({
    tmplIds: ['YOUR_TEMPLATE_ID'],
    success: () => {
      userStore.subscribed = true
      uni.showToast({ title: '订阅成功 🎉', icon: 'success' })
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
    uni.showToast({ title: (e as Error).message || '登录失败', icon: 'none' })
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
        <view v-else class="login-banner">
          <text class="text-body-sm">✅ 已登录</text>
        </view>

        <view class="btn-secondary" @tap="bindWeibo">
          {{ userStore.weiboBound ? '重新绑定微博' : '🔗 绑定微博账号' }}
        </view>
        <view class="btn-secondary mb-0" @tap="requestSubscribe">🔔 开启发博提醒</view>
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
