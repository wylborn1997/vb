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
    <view class="card card-cute">
      <view class="card-inner">
        <text class="empty-emoji">🔗</text>
        <text class="text-body-sm text-block">
          请在下方页面完成微博授权。授权成功后返回「我的」页面，就可以使用发评论功能啦～
        </text>
      </view>
    </view>
    <web-view v-if="authUrl" :src="authUrl" />
    <view v-else class="card empty-state">
      <text class="empty-emoji">😿</text>
      <text class="text-caption">暂无授权链接</text>
    </view>
  </view>
</template>
