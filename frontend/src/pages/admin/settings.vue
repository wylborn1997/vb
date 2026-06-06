<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { starApi, type Star } from '@/api/modules'

const stars = ref<Star[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    stars.value = await starApi.list()
  } finally {
    loading.value = false
  }
})

function addStar() {
  uni.showToast({ title: 'Phase 3 实现添加明星', icon: 'none' })
}
</script>

<template>
  <view class="page-container">
    <view class="mb-4 flex items-center justify-between">
      <text class="text-lg font-bold text-white">管理设置</text>
      <view class="rounded-full bg-brand px-4 py-1 text-xs text-white" @tap="addStar">+ 添加明星</view>
    </view>

    <view class="card mb-4">
      <text class="text-sm text-white/60">发博监测轮询间隔：3～5 分钟</text>
      <text class="mt-2 block text-xs text-white/30">监测 Cookie 需在服务端 .env 中配置</text>
    </view>

    <view v-if="loading" class="card text-center text-sm text-white/50">加载中...</view>

    <view v-for="star in stars" :key="star.id" class="card mb-3 flex items-center gap-3">
      <image v-if="star.avatar" :src="star.avatar" class="h-10 w-10 rounded-full" mode="aspectFill" />
      <view>
        <text class="block text-sm font-medium text-white">{{ star.nickname }}</text>
        <text class="text-xs text-white/40">UID: {{ star.userId }}</text>
      </view>
    </view>
  </view>
</template>
