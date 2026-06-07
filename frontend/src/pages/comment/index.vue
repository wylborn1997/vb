<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { commentApi, type CommentItem } from '@/api/modules'
import { useUserStore } from '@/stores/user'
import PageHeader from '@/components/PageHeader.vue'

const userStore = useUserStore()
const weiboUrl = ref('')
const keyword = ref('')
const comments = ref<CommentItem[]>([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)

onShow(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})

function extractWeiboId(url: string): string {
  const match = url.match(/(\d{10,})/)
  return match?.[1] || url.trim()
}

function ensureWeiboReady(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '需要登录',
      content: '控评功能需先微信登录并绑定微博账号',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
      },
    })
    return false
  }
  if (!userStore.weiboBound) {
    uni.showModal({
      title: '需要绑定微博',
      content: '读取评论需使用你的微博授权，请先在「我的」页面绑定',
      confirmText: '去绑定',
      success: (res) => {
        if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
      },
    })
    return false
  }
  return true
}

async function loadComments(reset = true) {
  if (!ensureWeiboReady()) return
  if (!weiboUrl.value.trim()) {
    uni.showToast({ title: '请输入微博链接', icon: 'none' })
    return
  }
  loading.value = true
  if (reset) {
    page.value = 1
    comments.value = []
  }
  try {
    const weiboId = extractWeiboId(weiboUrl.value)
    const res = await commentApi.list({
      weiboId,
      page: page.value,
      keyword: keyword.value || undefined,
    })
    comments.value = reset ? res.list : [...comments.value, ...res.list]
    hasMore.value = res.hasMore
  } catch (e) {
    const msg = (e as Error).message || '加载失败'
    if (msg.includes('绑定') || msg.includes('过期')) {
      uni.showModal({
        title: '微博授权',
        content: msg,
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
        },
      })
    } else {
      uni.showToast({ title: msg, icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value += 1
  loadComments(false)
}

function copyLink(item: CommentItem) {
  uni.setClipboardData({
    data: item.jumpUrl,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  })
}

function openWeibo(item: CommentItem) {
  copyLink(item)
  uni.showModal({
    title: '打开微博 💖',
    content: '链接已复制，请打开微博 App 粘贴访问并手动点赞～',
    showCancel: false,
  })
}
</script>

<template>
  <view class="page-container">
    <PageHeader
      emoji="🔍"
      title="控评助手"
      subtitle="找到目标评论，一键跳转去点赞"
    />

    <view v-if="userStore.isLoggedIn && !userStore.weiboBound" class="card card-cute">
      <view class="card-inner">
        <text class="text-body-sm text-block">⚠️ 尚未绑定微博，无法加载评论。请前往「我的」页面完成绑定。</text>
      </view>
    </view>

    <view class="card card-cute">
      <view class="card-inner">
        <text class="section-label">🔗 微博链接</text>
        <input
          v-model="weiboUrl"
          class="input-field"
          placeholder="粘贴微博链接或 ID"
          placeholder-class="placeholder-muted"
        />
        <text class="section-label">🏷️ 关键词过滤</text>
        <input
          v-model="keyword"
          class="input-field input-field-last"
          placeholder="应援口号、话题（可选）"
          placeholder-class="placeholder-muted"
        />
        <view class="btn-primary" @tap="loadComments(true)">
          {{ loading ? '加载中...' : '🚀 加载评论' }}
        </view>
      </view>
    </view>

    <view v-for="item in comments" :key="item.id" class="card">
      <view class="comment-header">
        <view class="comment-user">
          <view class="status-dot" />
          <text class="text-accent-sm">{{ item.userName }}</text>
        </view>
        <text class="text-caption">{{ item.createdAt }}</text>
      </view>
      <text class="text-body-sm text-block">{{ item.content }}</text>
      <view v-if="item.hasImage" class="category-badge">📷 含图片/表情</view>
      <view class="btn-row">
        <view class="btn-secondary btn-secondary-sm" @tap="copyLink(item)">复制链接</view>
        <view class="btn-primary btn-primary-inline" @tap="openWeibo(item)">打开微博</view>
      </view>
    </view>

    <view v-if="hasMore" class="btn-ghost text-center" @tap="loadMore">
      加载更多 ↓
    </view>
  </view>
</template>
