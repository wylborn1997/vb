<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedApi, type FeedItem } from '@/api/modules'
import FeedCard from '@/components/FeedCard.vue'

const feeds = ref<FeedItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    feeds.value = await feedApi.latest()
  } catch {
    feeds.value = []
  } finally {
    loading.value = false
  }
})

function goDetail(item: FeedItem) {
  uni.navigateTo({ url: `/pages/weibo/detail?id=${item.weiboId}` })
}

function goComment() {
  uni.switchTab({ url: '/pages/comment/index' })
}
</script>

<template>
  <view class="page-container">
    <view class="mb-4">
      <text class="text-xl font-bold text-white">最新动态</text>
      <text class="mt-1 block text-xs text-white/50">明星发博提醒 · 分钟级更新</text>
    </view>

    <view v-if="loading" class="card text-center text-sm text-white/50">加载中...</view>

    <view v-else-if="feeds.length === 0" class="card text-center">
      <text class="text-sm text-white/50">暂无新动态</text>
      <text class="mt-2 block text-xs text-white/30">管理员配置明星后，新博将在此展示</text>
    </view>

    <FeedCard
      v-for="item in feeds"
      :key="item.id"
      :item="item"
      @click="goDetail(item)"
    />

    <view class="fixed bottom-24 left-4 right-4">
      <view class="btn-primary" @tap="goComment">进入控评助手</view>
    </view>
  </view>
</template>
