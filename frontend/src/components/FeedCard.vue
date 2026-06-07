<script setup lang="ts">
defineProps<{
  item: {
    id: number
    weiboId: string
    content: string
    publishTime: string
    star?: { nickname: string; avatar: string }
  }
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <view class="card card-cute" @tap="$emit('click')">
    <view class="card-inner feed-header">
      <view class="avatar-ring">
        <image
          v-if="item.star?.avatar"
          :src="item.star.avatar"
          class="avatar-img"
          mode="aspectFill"
        />
        <view v-else class="avatar-fallback">✨</view>
      </view>
      <view class="feed-meta">
        <text class="text-accent-sm text-block">{{ item.star?.nickname || '明星' }}</text>
        <text class="text-caption text-block">{{ item.publishTime }}</text>
      </view>
      <text class="badge-new">新动态</text>
    </view>
    <text class="card-inner text-body-sm line-clamp-3 text-block">{{ item.content }}</text>
    <view class="card-inner feed-action">
      <text>💖 查看详情 · 快捷评论</text>
    </view>
  </view>
</template>
