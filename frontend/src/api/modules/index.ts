import { request } from '@/api/request'

export interface Star {
  id: number
  userId: string
  nickname: string
  avatar: string
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

export const authApi = {
  wechatLogin: (code: string) =>
    request<{ token: string }>({ url: '/auth/wechat', method: 'POST', data: { code }, auth: false }),
  getWeiboAuthUrl: () => request<{ url: string }>({ url: '/auth/weibo/url' }),
}

export const starApi = {
  list: () => request<Star[]>({ url: '/stars' }),
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
  subscribe: (templateIds: string[]) =>
    request<void>({ url: '/notify/subscribe', method: 'POST', data: { templateIds } }),
}
