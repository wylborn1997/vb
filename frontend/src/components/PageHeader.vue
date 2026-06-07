<script setup lang="ts">
defineProps<{
  emoji?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <view class="page-header">
    <view class="page-title-row">
      <text v-if="emoji" class="page-emoji">{{ emoji }}</text>
      <view>
        <text class="page-title">{{ title }}</text>
        <text v-if="subtitle" class="page-subtitle">{{ subtitle }}</text>
      </view>
    </view>
  </view>
</template>
