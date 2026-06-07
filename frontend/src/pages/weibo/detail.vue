<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { weiboApi, commentApi, templateApi, type TemplateItem } from '@/api/modules'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const weiboId = ref('')
const content = ref('')
const commentText = ref('')
const templates = ref<TemplateItem[]>([])
const sending = ref(false)
const activeTemplateId = ref<number | null>(null)

onLoad((query) => {
  weiboId.value = (query?.id as string) || ''
})

onShow(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
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
  activeTemplateId.value = t.id
}

function ensureWeiboReady(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '需要登录',
      content: '发评论需先微信登录并绑定微博账号',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
      },
    })
    return false
  }
  if (!userStore.weiboBound) {
    uni.showModal({
      title: '需要绑定微博',
      content: '发评论需使用你的微博授权，请先在「我的」页面绑定',
      confirmText: '去绑定',
      success: (res) => {
        if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
      },
    })
    return false
  }
  return true
}

async function sendComment() {
  if (!ensureWeiboReady()) return
  if (!commentText.value.trim()) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }
  sending.value = true
  try {
    await commentApi.send({ weiboId: weiboId.value, content: commentText.value })
    uni.showToast({ title: '评论成功 🎉', icon: 'success' })
    commentText.value = ''
    activeTemplateId.value = null
  } catch (e) {
    const msg = (e as Error).message || '发送失败'
    if (msg.includes('绑定') || msg.includes('过期')) {
      uni.showModal({
        title: '微博授权',
        content: msg,
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) uni.switchTab({ url: '/pages/mine/index' })
        },
      })
    } else {
      uni.showToast({ title: msg, icon: 'none' })
    }
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <view class="page-container">
    <view class="card card-cute">
      <view class="card-inner">
        <text class="category-badge mb-2">📢 微博正文</text>
        <text class="text-body-sm text-block">{{ content || '加载中...' }}</text>
      </view>
    </view>

    <view v-if="userStore.isLoggedIn && !userStore.weiboBound" class="card card-cute">
      <view class="card-inner">
        <text class="text-body-sm text-block">⚠️ 尚未绑定微博，无法发评论。请前往「我的」页面完成绑定。</text>
      </view>
    </view>

    <text class="section-label">💬 选择模板</text>
    <scroll-view scroll-x class="tag-scroll">
      <view
        v-for="t in templates"
        :key="t.id"
        :class="activeTemplateId === t.id ? 'tag-chip-active' : 'tag-chip'"
        @tap="applyTemplate(t)"
      >
        {{ t.title }}
      </view>
    </scroll-view>

    <text class="section-label">✏️ 编辑评论</text>
    <textarea
      v-model="commentText"
      class="input-field textarea-field"
      placeholder="写下你的应援评论吧～"
      placeholder-class="placeholder-muted"
      maxlength="140"
    />

    <view class="bottom-bar">
      <view class="btn-primary" :class="{ disabled: sending }" @tap="sendComment">
        {{ sending ? '发送中...' : '💖 发送评论' }}
      </view>
    </view>
  </view>
</template>
