import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { env } from '../config/env.js'

const dir = path.dirname(env.databasePath)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

export const db = new Database(env.databasePath)

db.pragma('journal_mode = WAL')

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      weibo_uid TEXT,
      weibo_token TEXT,
      weibo_token_expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weibo_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      star_id INTEGER NOT NULL,
      weibo_id TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      publish_time TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (star_id) REFERENCES stars(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      template_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  const count = db.prepare('SELECT COUNT(*) as c FROM stars').get() as { c: number }
  if (count.c === 0) {
    db.prepare(
      'INSERT INTO stars (user_id, nickname, avatar) VALUES (?, ?, ?)'
    ).run('1669879400', '示例明星', '')
  }

  const tplCount = db.prepare('SELECT COUNT(*) as c FROM templates').get() as { c: number }
  if (tplCount.c === 0) {
    const inserts = [
      ['控评模板', '支持支持！期待更多作品～', '控评'],
      ['彩虹屁', '也太绝了吧！颜值实力都在线！', '彩虹屁'],
    ]
    const stmt = db.prepare(
      'INSERT INTO templates (title, content, category) VALUES (?, ?, ?)'
    )
    for (const row of inserts) stmt.run(...row)
  }
}
