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
  <view class="card mb-3 active:opacity-80" @tap="$emit('click')">
    <view class="mb-2 flex items-center gap-2">
      <image
        v-if="item.star?.avatar"
        :src="item.star.avatar"
        class="h-8 w-8 rounded-full"
        mode="aspectFill"
      />
      <view v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-brand/30 text-xs">
        星
      </view>
      <text class="text-sm font-medium text-white">{{ item.star?.nickname || '明星' }}</text>
      <text class="ml-auto text-xs text-white/40">{{ item.publishTime }}</text>
    </view>
    <text class="line-clamp-3 text-sm leading-relaxed text-white/80">{{ item.content }}</text>
    <text class="mt-2 block text-xs text-brand">查看详情 · 快捷评论</text>
  </view>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
