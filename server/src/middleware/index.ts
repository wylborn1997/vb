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
