import type { DailyLog, Rabbit, StatusTag } from '../types'
import { DEFAULT_NOTES, DEFAULT_TAGS } from './constants'

export function uid(): string {
  return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

export function toDateKey(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

export function logKey(rabbitId: string, d: Date): string {
  return rabbitId + '|' + toDateKey(d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatDisplayDate(d: Date): string {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return d.getMonth() + 1 + '月' + d.getDate() + '日 · 星期' + week[d.getDay()]
}

export function dateLabelFor(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cmp = new Date(d)
  cmp.setHours(0, 0, 0, 0)
  const diff = Math.round((cmp.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return '今日'
  if (diff === -1) return '昨日'
  if (diff === 1) return '明日'
  return d.getMonth() + 1 + '/' + d.getDate()
}

export function emptyLog(): DailyLog {
  return {
    appetite: '',
    poop: '',
    activity: '',
    weight: null,
    teeth: '',
    pain: '',
    notes: '',
  }
}

export function deriveTagsFromLog(log: DailyLog | null): StatusTag[] {
  if (!log) {
    return [
      { label: '食慾待記', style: '' },
      { label: '便便待記', style: '' },
      { label: '活動待記', style: '' },
      { label: '體重待記', style: '' },
    ]
  }
  function appetiteTag(v: string) {
    if (!v) return { label: '食慾待記', style: '' as const }
    if (v === '良好' || v === '普通') return { label: '食慾正常', style: 'good' as const }
    return { label: '食慾留意', style: 'watch' as const }
  }
  function poopTag(v: string) {
    if (!v) return { label: '便便待記', style: '' as const }
    if (v === '正常') return { label: '便便正常', style: 'good' as const }
    return { label: '便便留意', style: 'watch' as const }
  }
  function activityTag(v: string) {
    if (!v) return { label: '活動待記', style: '' as const }
    if (v === '活躍' || v === '普通') return { label: '活動正常', style: 'good' as const }
    return { label: '活動留意', style: 'watch' as const }
  }
  function weightTag(v: number | null | '') {
    if (v == null || v === '') return { label: '體重待記', style: '' as const }
    return { label: '體重已記', style: 'good' as const }
  }
  return [
    appetiteTag(log.appetite),
    poopTag(log.poop),
    activityTag(log.activity),
    weightTag(log.weight),
  ]
}

export function statusClassFor(field: string, value: string | number | null): '' | 'good' | 'watch' {
  if (!value && value !== 0) return ''
  if (field === 'appetite') return value === '良好' || value === '普通' ? 'good' : 'watch'
  if (field === 'poop') return value === '正常' ? 'good' : 'watch'
  if (field === 'activity') return value === '活躍' || value === '普通' ? 'good' : 'watch'
  if (field === 'weight') return 'good'
  return ''
}

export function statusLabelFor(field: string, value: string | number | null): string {
  if (!value && value !== 0) return '—'
  if (field === 'appetite') return value === '良好' || value === '普通' ? '正常' : '留意'
  if (field === 'poop') return value === '正常' ? '正常' : '留意'
  if (field === 'activity') return value === '活躍' || value === '普通' ? '正常' : '留意'
  if (field === 'weight') return '已記'
  return String(value)
}

export function buildSummary(log: DailyLog | null): { text: string; alert: boolean } {
  if (!log || (!log.appetite && !log.poop && !log.activity && log.weight == null)) {
    return { text: '尚未填寫今日狀態，點下方按鈕開始記錄。', alert: false }
  }
  const watches: string[] = []
  if (log.appetite && !(log.appetite === '良好' || log.appetite === '普通'))
    watches.push('食慾' + log.appetite)
  if (log.poop && log.poop !== '正常') watches.push('便便' + log.poop)
  if (log.activity && !(log.activity === '活躍' || log.activity === '普通'))
    watches.push('活動' + log.activity)
  if (log.pain && log.pain !== '無') watches.push('痛楚' + log.pain)
  if (watches.length) {
    return { text: watches.join('、') + '。其餘見下方指標。建議持續觀察。', alert: true }
  }
  return { text: '今日狀態大致正常，已儲存記錄。', alert: false }
}

export function seedRabbit(avatar: string | null = null): Rabbit {
  return {
    id: uid(),
    name: '兔兔',
    ageLabel: '高齡 · 約 8 歲',
    breed: '垂耳兔',
    weight: 2.4,
    avatar,
    tags: DEFAULT_TAGS.map((t) => ({ ...t })),
    notes: DEFAULT_NOTES,
    customTopics: [],
    diaryTitle: '兔子日記',
  }
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function weekSummaryFromLog(log: DailyLog | null): string {
  if (!log) return '—'
  const summary = buildSummary(log)
  if (!log.appetite && !log.poop && !log.activity) return '—'
  if (summary.alert) {
    const parts: string[] = []
    if (log.appetite && !(log.appetite === '良好' || log.appetite === '普通'))
      parts.push('食慾' + log.appetite)
    if (log.activity && !(log.activity === '活躍' || log.activity === '普通'))
      parts.push('活動' + log.activity)
    return parts.length ? parts.join(' · ') : summary.text.slice(0, 20)
  }
  return '一切正常'
}

export function nextDefaultName(rabbits: Rabbit[]): string {
  const used = new Set(rabbits.map((r) => r.name))
  if (!used.has('兔兔')) return '兔兔'
  for (let i = 2; i <= 10; i++) {
    const n = '兔兔' + i
    if (!used.has(n)) return n
  }
  return '兔兔' + (rabbits.length + 1)
}

export function normalizeRabbit(raw: Partial<Rabbit> & { id: string }): Rabbit {
  return {
    id: raw.id,
    name: raw.name || '兔兔',
    ageLabel: raw.ageLabel ?? '',
    breed: raw.breed ?? '',
    weight: raw.weight ?? null,
    avatar: raw.avatar ?? null,
    tags: raw.tags ?? deriveTagsFromLog(null),
    notes: raw.notes || DEFAULT_NOTES,
    customTopics: Array.isArray(raw.customTopics) ? raw.customTopics.slice(0, 8) : [],
    diaryTitle: (raw.diaryTitle && String(raw.diaryTitle).trim()) || '兔子日記',
  }
}
