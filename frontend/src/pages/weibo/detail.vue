<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { weiboApi, commentApi, templateApi, type TemplateItem } from '@/api/modules'

const weiboId = ref('')
const content = ref('')
const commentText = ref('')
const templates = ref<TemplateItem[]>([])
const sending = ref(false)

onLoad((query) => {
  weiboId.value = (query?.id as string) || ''
})

onMounted(async () => {
  if (!weiboId.value) return
  try {
    const detail = await weiboApi.detail(weiboId.value)
    content.value = detail.content
    templates.value = await templateApi.list()
  } catch {
    content.value = '加载失败，请稍后重试'
  }
})

function applyTemplate(t: TemplateItem) {
  commentText.value = t.content
}

async function sendComment() {
  if (!commentText.value.trim()) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }
  sending.value = true
  try {
    await commentApi.send({ weiboId: weiboId.value, content: commentText.value })
    uni.showToast({ title: '评论成功', icon: 'success' })
    commentText.value = ''
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '发送失败', icon: 'none' })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <view class="page-container">
    <view class="card mb-4">
      <text class="text-sm leading-relaxed text-white/90">{{ content || '加载中...' }}</text>
    </view>

    <view class="mb-3">
      <text class="text-sm font-medium text-white">评论模板</text>
    </view>
    <scroll-view scroll-x class="mb-4 whitespace-nowrap">
      <view
        v-for="t in templates"
        :key="t.id"
        class="mr-2 inline-block rounded-full bg-white/10 px-4 py-2 text-xs text-white/80"
        @tap="applyTemplate(t)"
      >
        {{ t.title }}
      </view>
    </scroll-view>

    <textarea
      v-model="commentText"
      class="input-field mb-4 min-h-24"
      placeholder="编辑评论内容..."
      maxlength="140"
    />

    <view class="fixed bottom-0 left-0 right-0 bg-surface-card p-4">
      <view class="btn-primary" :class="{ 'opacity-50': sending }" @tap="sendComment">
        {{ sending ? '发送中...' : '发送评论' }}
      </view>
    </view>
  </view>
</template>
