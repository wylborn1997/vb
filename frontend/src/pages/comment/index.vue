<script setup lang="ts">
import { ref } from 'vue'
import { commentApi, type CommentItem } from '@/api/modules'

const weiboUrl = ref('')
const keyword = ref('')
const comments = ref<CommentItem[]>([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)

function extractWeiboId(url: string): string {
  const match = url.match(/(\d{10,})/)
  return match?.[1] || url.trim()
}

async function loadComments(reset = true) {
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
    uni.showToast({ title: (e as Error).message || '加载失败', icon: 'none' })
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
    title: '打开微博',
    content: '链接已复制，请打开微博 App 粘贴访问并手动点赞',
    showCancel: false,
  })
}
</script>

<template>
  <view class="page-container">
    <view class="card mb-4">
      <input
        v-model="weiboUrl"
        class="input-field mb-3"
        placeholder="粘贴微博链接或 ID"
      />
      <input
        v-model="keyword"
        class="input-field mb-3"
        placeholder="关键词过滤（可选）"
      />
      <view class="btn-primary" @tap="loadComments(true)">
        {{ loading ? '加载中...' : '加载评论' }}
      </view>
    </view>

    <view v-for="item in comments" :key="item.id" class="card mb-3">
      <view class="mb-1 flex items-center justify-between">
        <text class="text-xs text-brand">{{ item.userName }}</text>
        <text class="text-xs text-white/40">{{ item.createdAt }}</text>
      </view>
      <text class="text-sm text-white/85">{{ item.content }}</text>
      <view v-if="item.hasImage" class="mt-1 text-xs text-white/40">[含图片/表情]</view>
      <view class="mt-3 flex gap-2">
        <view class="btn-secondary flex-1 text-xs" @tap="copyLink(item)">复制链接</view>
        <view class="btn-primary flex-1 text-xs" @tap="openWeibo(item)">打开微博</view>
      </view>
    </view>

    <view v-if="hasMore" class="btn-secondary mb-8 text-center text-sm" @tap="loadMore">
      加载更多
    </view>
  </view>
</template>
