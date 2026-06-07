<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi, starApi, type AdminStatus, type Star } from '@/api/modules'
import PageHeader from '@/components/PageHeader.vue'

const stars = ref<Star[]>([])
const status = ref<AdminStatus | null>(null)
const loading = ref(true)
const saving = ref(false)

const formUserId = ref('')
const formNickname = ref('')
const formAvatar = ref('')
const showForm = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const [starList, adminStatus] = await Promise.all([
      starApi.listManage(),
      adminApi.status(),
    ])
    stars.value = starList
    status.value = adminStatus
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function openForm() {
  formUserId.value = ''
  formNickname.value = ''
  formAvatar.value = ''
  showForm.value = true
}

async function submitStar() {
  if (!formUserId.value.trim() || !formNickname.value.trim()) {
    uni.showToast({ title: '请填写 UID 和昵称', icon: 'none' })
    return
  }
  saving.value = true
  try {
    await starApi.create({
      userId: formUserId.value.trim(),
      nickname: formNickname.value.trim(),
      avatar: formAvatar.value.trim(),
    })
    showForm.value = false
    uni.showToast({ title: '添加成功', icon: 'success' })
    await load()
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '添加失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

async function toggleStar(star: Star) {
  const enabled = !(star.enabled === 1 || star.enabled === true)
  try {
    await starApi.update(star.id, { enabled })
    await load()
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '更新失败', icon: 'none' })
  }
}

function removeStar(star: Star) {
  uni.showModal({
    title: '删除明星',
    content: `确定删除 ${star.nickname} 吗？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        await starApi.remove(star.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        await load()
      } catch (e) {
        uni.showToast({ title: (e as Error).message || '删除失败', icon: 'none' })
      }
    },
  })
}

async function toggleMonitor() {
  if (!status.value) return
  try {
    await adminApi.setMonitor(!status.value.monitorEnabled)
    await load()
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '设置失败', icon: 'none' })
  }
}

async function runMonitorNow() {
  uni.showLoading({ title: '监测中...' })
  try {
    await adminApi.runMonitor()
    await load()
    uni.showToast({ title: '监测完成', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: (e as Error).message || '监测失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function formatTime(value: string | null) {
  if (!value) return '尚未执行'
  try {
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return value
  }
}
</script>

<template>
  <view class="page-container">
    <view class="header-row">
      <view class="header-row-main">
        <PageHeader emoji="⭐" title="管理设置" subtitle="明星监测与系统配置" />
      </view>
      <view class="btn-primary btn-primary-sm" @tap="openForm">+ 添加</view>
    </view>

    <view v-if="status" class="card card-cute">
      <view class="card-inner">
        <text class="section-label">📡 监测状态</text>
        <text class="text-body-sm text-block">
          轮询间隔：每 5 分钟 · {{ status.monitorEnabled ? '已开启' : '已关闭' }}
        </text>
        <text class="text-caption text-block">
          数据源：{{ status.monitorConfigured ? '已配置' : '未配置 Cookie/Token' }}
        </text>
        <text class="text-caption text-block mb-2">
          订阅推送：{{ status.notifyConfigured ? '已配置' : '未配置模板 ID' }}
        </text>
        <text class="text-caption text-block mb-2">
          上次执行：{{ formatTime(status.monitorLastRunAt) }}
        </text>
        <view class="btn-row">
          <view class="btn-secondary btn-secondary-sm" @tap="toggleMonitor">
            {{ status.monitorEnabled ? '关闭监测' : '开启监测' }}
          </view>
          <view class="btn-primary btn-primary-inline" @tap="runMonitorNow">立即检测</view>
        </view>
      </view>
    </view>

    <view v-if="showForm" class="card card-cute">
      <view class="card-inner">
        <text class="section-label">➕ 添加明星</text>
        <input
          v-model="formUserId"
          class="input-field"
          placeholder="微博 user_id（数字 UID）"
          placeholder-class="placeholder-muted"
        />
        <input
          v-model="formNickname"
          class="input-field"
          placeholder="昵称"
          placeholder-class="placeholder-muted"
        />
        <input
          v-model="formAvatar"
          class="input-field input-field-last"
          placeholder="头像 URL（可选）"
          placeholder-class="placeholder-muted"
        />
        <view class="btn-row">
          <view class="btn-ghost btn-secondary-sm" @tap="showForm = false">取消</view>
          <view class="btn-primary btn-primary-inline" @tap="submitStar">
            {{ saving ? '保存中...' : '保存' }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="loading" class="card empty-state">
      <text class="empty-emoji">⏳</text>
      <text class="text-caption">加载中...</text>
    </view>

    <view v-for="star in stars" :key="star.id" class="card star-row">
      <view class="avatar-ring">
        <image
          v-if="star.avatar"
          :src="star.avatar"
          class="avatar-img avatar-img-lg"
          mode="aspectFill"
        />
        <view v-else class="avatar-fallback avatar-fallback-lg">🌟</view>
      </view>
      <view class="star-row-main">
        <text class="text-accent-sm text-block">{{ star.nickname }}</text>
        <text class="text-caption text-block">UID: {{ star.userId }}</text>
        <text class="text-caption text-block">
          {{ star.enabled === 1 || star.enabled === true ? '监测中' : '已暂停' }}
        </text>
      </view>
      <view class="star-row-actions">
        <view class="btn-ghost btn-secondary-sm" @tap="toggleStar(star)">
          {{ star.enabled === 1 || star.enabled === true ? '暂停' : '启用' }}
        </view>
        <view class="btn-ghost btn-secondary-sm" @tap="removeStar(star)">删除</view>
      </view>
    </view>
  </view>
</template>
