import { request } from '@/api/request'

export interface Star {
  id: number
  userId: string
  nickname: string
  avatar: string
  enabled?: number | boolean
}

export interface AdminStatus {
  monitorEnabled: boolean
  monitorConfigured: boolean
  monitorRunning: boolean
  monitorLastRunAt: string | null
  notifyConfigured: boolean
  subscribeTemplateId: string | null
  starCount: number
  adminRestricted: boolean
}

export interface NotifyConfig {
  templateId: string | null
  notifyConfigured: boolean
  subscribed: boolean
}

export interface FeedItem {
  id: number
  starId: number
  weiboId: string
  content: string
  publishTime: string
  star?: Star
}

export interface WeiboDetail {
  id: string
  content: string
  publishTime: string
  pics: string[]
  commentsCount: number
  star?: Star
}

export interface CommentItem {
  id: string
  content: string
  userName: string
  createdAt: string
  likeCount: number
  hasImage: boolean
  jumpUrl: string
}

export interface TemplateItem {
  id: number
  title: string
  content: string
  category: string
}

export interface UserProfile {
  userId: number
  openid: string
  weiboBound: boolean
  weiboUid: string
  weiboTokenExpiresAt: string | null
}

export const authApi = {
  wechatLogin: (code: string) =>
    request<{ token: string }>({ url: '/auth/wechat', method: 'POST', data: { code }, auth: false }),
  getProfile: () => request<UserProfile>({ url: '/auth/me' }),
  getWeiboAuthUrl: () => request<{ url: string }>({ url: '/auth/weibo/url' }),
  unbindWeibo: () => request<{ success: boolean }>({ url: '/auth/weibo/unbind', method: 'POST' }),
}

export const starApi = {
  list: () => request<Star[]>({ url: '/stars' }),
  listManage: () => request<Star[]>({ url: '/stars/manage' }),
  create: (data: { userId: string; nickname: string; avatar?: string }) =>
    request<Star>({ url: '/stars', method: 'POST', data }),
  update: (id: number, data: Partial<{ nickname: string; avatar: string; enabled: boolean }>) =>
    request<Star>({ url: `/stars/${id}`, method: 'PUT', data }),
  remove: (id: number) => request<{ success: boolean }>({ url: `/stars/${id}`, method: 'DELETE' }),
}

export const adminApi = {
  status: () => request<AdminStatus>({ url: '/admin/status' }),
  setMonitor: (enabled: boolean) =>
    request<{ enabled: boolean }>({ url: '/admin/monitor', method: 'PATCH', data: { enabled } }),
  runMonitor: () => request<AdminStatus>({ url: '/admin/monitor/run', method: 'POST' }),
}

export const feedApi = {
  latest: () => request<FeedItem[]>({ url: '/feed/latest' }),
}

export const weiboApi = {
  detail: (id: string) => request<WeiboDetail>({ url: `/weibo/${id}` }),
}

export const commentApi = {
  list: (params: { weiboId: string; page?: number; keyword?: string }) =>
    request<{ list: CommentItem[]; hasMore: boolean }>({
      url: '/comments',
      data: params,
    }),
  send: (data: { weiboId: string; content: string }) =>
    request<{ success: boolean }>({ url: '/comments/send', method: 'POST', data }),
}

export const templateApi = {
  list: () => request<TemplateItem[]>({ url: '/templates' }),
  create: (data: Omit<TemplateItem, 'id'>) =>
    request<TemplateItem>({ url: '/templates', method: 'POST', data }),
  update: (id: number, data: Partial<Omit<TemplateItem, 'id'>>) =>
    request<TemplateItem>({ url: `/templates/${id}`, method: 'PUT', data }),
  remove: (id: number) => request<void>({ url: `/templates/${id}`, method: 'DELETE' }),
}

export const notifyApi = {
  getConfig: () => request<NotifyConfig>({ url: '/notify/config' }),
  subscribe: (templateIds: string[]) =>
    request<{ success: boolean }>({ url: '/notify/subscribe', method: 'POST', data: { templateIds } }),
}
