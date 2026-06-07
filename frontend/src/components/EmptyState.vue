<script setup lang="ts">
defineProps<{
  emoji?: string
  title: string
  hint?: string
}>()
</script>

<template>
  <view class="card empty-state">
    <text v-if="emoji" class="empty-emoji">{{ emoji }}</text>
    <text class="text-body text-block">{{ title }}</text>
    <text v-if="hint" class="text-caption text-block mb-2">{{ hint }}</text>
  </view>
</template>
