<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templateApi, type TemplateItem } from '@/api/modules'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'

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
    title: '新建模板 ✏️',
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
    <view class="header-row">
      <view class="header-row-main">
        <PageHeader emoji="💬" title="评论模板" subtitle="预设应援文案，一键发送" />
      </view>
      <view class="btn-primary btn-primary-sm" @tap="addTemplate">+ 新建</view>
    </view>

    <view v-if="loading" class="card empty-state">
      <text class="empty-emoji">⏳</text>
      <text class="text-caption">加载中...</text>
    </view>

    <view v-for="t in templates" :key="t.id" class="card card-cute">
      <view class="card-inner">
        <text class="text-accent-sm text-block mb-2">{{ t.title }}</text>
        <text class="text-body-sm text-block">{{ t.content }}</text>
        <text class="category-badge">{{ t.category }}</text>
      </view>
    </view>

    <EmptyState
      v-if="!loading && templates.length === 0"
      emoji="📝"
      title="还没有模板哦"
      hint="点击右上角新建你的第一条应援文案～"
    />
  </view>
</template>
