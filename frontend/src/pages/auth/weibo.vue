<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const authUrl = ref('')

onLoad((query) => {
  authUrl.value = decodeURIComponent((query?.url as string) || '')
})

onMounted(() => {
  if (!authUrl.value) {
    uni.showToast({ title: '授权链接无效', icon: 'none' })
  }
})
</script>

<template>
  <view class="page-container">
    <view class="card mb-4">
      <text class="text-sm text-white/70">
        请在下方页面完成微博授权。授权成功后返回「我的」页面即可使用发评论功能。
      </text>
    </view>
    <web-view v-if="authUrl" :src="authUrl" />
    <view v-else class="card text-center text-sm text-white/50">暂无授权链接</view>
  </view>
</template>
