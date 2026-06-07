import { db } from '../db/index.js'

export function getSetting(key: string, fallback = ''): string {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? fallback
}

export function setSetting(key: string, value: string) {
  db.prepare(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value)
}

export function isMonitorEnabled(): boolean {
  return getSetting('monitor_enabled', '1') === '1'
}

export function setMonitorEnabled(enabled: boolean) {
  setSetting('monitor_enabled', enabled ? '1' : '0')
}

export function getMonitorLastRunAt(): string | null {
  const value = getSetting('monitor_last_run_at', '')
  return value || null
}

export function setMonitorLastRunAt(iso: string) {
  setSetting('monitor_last_run_at', iso)
}
