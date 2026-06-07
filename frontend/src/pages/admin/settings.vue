<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { starApi, type Star } from '@/api/modules'
import PageHeader from '@/components/PageHeader.vue'

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
    <view class="header-row">
      <view class="header-row-main">
        <PageHeader emoji="⭐" title="管理设置" subtitle="明星监测与系统配置" />
      </view>
      <view class="btn-primary btn-primary-sm" @tap="addStar">+ 添加</view>
    </view>

    <view class="card card-cute">
      <view class="card-inner">
        <text class="section-label">📡 监测状态</text>
        <text class="text-body-sm text-block">发博监测轮询间隔：3～5 分钟</text>
        <text class="text-caption text-block mb-2">监测 Cookie 需在服务端 .env 中配置</text>
      </view>
    </view>

    <view v-if="loading" class="card empty-state">
      <text class="empty-emoji">⏳</text>
      <text class="text-caption">加载中...</text>
    </view>

    <view v-for="star in stars" :key="star.id" class="card star-row">
      <view class="avatar-ring">
        <image
          v-if="star.avatar"
          :src="star.avatar"
          class="avatar-img avatar-img-lg"
          mode="aspectFill"
        />
        <view v-else class="avatar-fallback avatar-fallback-lg">🌟</view>
      </view>
      <view>
        <text class="text-accent-sm text-block">{{ star.nickname }}</text>
        <text class="text-caption text-block">UID: {{ star.userId }}</text>
      </view>
    </view>
  </view>
</template>
