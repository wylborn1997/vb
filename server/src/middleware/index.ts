import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AuthPayload {
  userId: number
  openid: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function ok<T>(res: Response, data: T, message = 'ok') {
  res.json({ code: 0, message, data })
}

export function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ code: status, message, data: null })
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return fail(res, '未登录', 401)
  }
  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, env.jwtSecret) as AuthPayload
    next()
  } catch {
    return fail(res, '登录已过期', 401)
  }
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export function signWeiboOAuthState(userId: number) {
  return jwt.sign({ userId, type: 'weibo_oauth' }, env.jwtSecret, { expiresIn: '15m' })
}

export function verifyWeiboOAuthState(state: string): number {
  const payload = jwt.verify(state, env.jwtSecret) as { userId?: number; type?: string }
  if (payload.type !== 'weibo_oauth' || !payload.userId) {
    throw new Error('无效的授权 state')
  }
  return payload.userId
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return fail(res, '未登录', 401)
  if (env.adminOpenids.length === 0) return next()
  if (!env.adminOpenids.includes(req.user.openid)) {
    return fail(res, '无管理员权限', 403)
  }
  next()
}
