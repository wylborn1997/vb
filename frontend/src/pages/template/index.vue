<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templateApi, type TemplateItem } from '@/api/modules'

const templates = ref<TemplateItem[]>([])
const loading = ref(true)

onMounted(load)

async function load() {
  loading.value = true
  try {
    templates.value = await templateApi.list()
  } finally {
    loading.value = false
  }
}

function addTemplate() {
  uni.showModal({
    title: '新建模板',
    editable: true,
    placeholderText: '输入模板内容',
    success: async (res) => {
      if (!res.confirm || !res.content) return
      await templateApi.create({
        title: res.content.slice(0, 10),
        content: res.content,
        category: 'default',
      })
      await load()
    },
  })
}
</script>

<template>
  <view class="page-container">
    <view class="mb-4 flex items-center justify-between">
      <text class="text-lg font-bold text-white">评论模板</text>
      <view class="rounded-full bg-brand px-4 py-1 text-xs text-white" @tap="addTemplate">+ 新建</view>
    </view>

    <view v-if="loading" class="card text-center text-sm text-white/50">加载中...</view>

    <view v-for="t in templates" :key="t.id" class="card mb-3">
      <text class="mb-1 block text-sm font-medium text-brand">{{ t.title }}</text>
      <text class="text-sm text-white/80">{{ t.content }}</text>
      <text class="mt-2 block text-xs text-white/30">{{ t.category }}</text>
    </view>

    <view v-if="!loading && templates.length === 0" class="card text-center text-sm text-white/50">
      暂无模板，点击右上角新建
    </view>
  </view>
</template>
