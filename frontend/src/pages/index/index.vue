<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedApi, type FeedItem } from '@/api/modules'
import FeedCard from '@/components/FeedCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'

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
    <PageHeader
      emoji="🌸"
      title="最新动态"
      subtitle="明星发博提醒 · 分钟级更新"
    />

    <view v-if="loading" class="card empty-state">
      <text class="empty-emoji">⏳</text>
      <text class="text-caption">加载中...</text>
    </view>

    <EmptyState
      v-else-if="feeds.length === 0"
      emoji="🐣"
      title="暂无新动态"
      hint="管理员配置明星后，新博将在这里出现哦～"
    />

    <FeedCard
      v-for="item in feeds"
      :key="item.id"
      :item="item"
      @click="goDetail(item)"
    />

    <view class="fab-bar">
      <view class="btn-primary" @tap="goComment">✨ 进入控评助手</view>
    </view>
  </view>
</template>
