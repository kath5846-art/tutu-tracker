import type { DailyLog, LogsMap, Rabbit, TrackerState } from '../types'
import { MAX_CUSTOM_TOPICS, MAX_RABBITS } from './constants'
import {
  getSupabase,
  isSupabaseConfigured,
  type DbLog,
  type DbRabbit,
} from './supabaseClient'
import { logKey, normalizeRabbit, seedRabbit, uid } from './trackerUtils'

function storageKey(userId: string, suffix: string) {
  return `tutu-${userId}-${suffix}`
}

function loadMockState(userId: string): TrackerState {
  try {
    const rawR = localStorage.getItem(storageKey(userId, 'rabbits'))
    let rabbits: Rabbit[] = rawR ? JSON.parse(rawR) : []
    if (!Array.isArray(rabbits) || rabbits.length === 0) {
      rabbits = [seedRabbit(null)]
      saveMockRabbits(userId, rabbits)
    } else {
      rabbits = rabbits.map((r) => normalizeRabbit(r))
    }
    let activeId = localStorage.getItem(storageKey(userId, 'active'))
    if (!activeId || !rabbits.find((r) => r.id === activeId)) {
      activeId = rabbits[0].id
    }
    let logs: LogsMap = {}
    try {
      const rawL = localStorage.getItem(storageKey(userId, 'logs'))
      logs = rawL ? JSON.parse(rawL) : {}
    } catch {
      logs = {}
    }
    return { rabbits, activeId, logs }
  } catch {
    const rabbits = [seedRabbit(null)]
    return { rabbits, activeId: rabbits[0].id, logs: {} }
  }
}

function saveMockRabbits(userId: string, rabbits: Rabbit[]) {
  localStorage.setItem(storageKey(userId, 'rabbits'), JSON.stringify(rabbits))
}

function saveMockLogs(userId: string, logs: LogsMap) {
  localStorage.setItem(storageKey(userId, 'logs'), JSON.stringify(logs))
}

function saveMockActive(userId: string, activeId: string | null) {
  if (activeId) localStorage.setItem(storageKey(userId, 'active'), activeId)
}

function dbToRabbit(row: DbRabbit): Rabbit {
  return normalizeRabbit({
    id: row.id,
    name: row.name,
    ageLabel: row.age_label ?? '',
    breed: row.breed ?? '',
    weight: row.weight,
    avatar: row.avatar,
    notes: row.notes ?? undefined,
    diaryTitle: row.diary_title ?? undefined,
    customTopics: row.custom_topics ?? [],
  })
}

function rabbitToDb(r: Rabbit, userId: string): Omit<DbRabbit, 'id'> & { id?: string } {
  return {
    id: r.id,
    user_id: userId,
    name: r.name,
    age_label: r.ageLabel,
    breed: r.breed,
    weight: r.weight,
    avatar: r.avatar,
    notes: r.notes,
    diary_title: r.diaryTitle,
    custom_topics: r.customTopics.slice(0, MAX_CUSTOM_TOPICS),
  }
}

function dbToLog(row: DbLog): DailyLog {
  return {
    appetite: row.appetite ?? '',
    poop: row.poop ?? '',
    activity: row.activity ?? '',
    weight: row.weight,
    teeth: row.teeth ?? '',
    pain: row.pain ?? '',
    notes: row.notes ?? '',
  }
}

export async function loadTrackerState(userId: string): Promise<TrackerState> {
  if (!isSupabaseConfigured) {
    return loadMockState(userId)
  }
  const supabase = getSupabase()!
  const [{ data: rabbitRows }, { data: logRows }, { data: settings }] = await Promise.all([
    supabase.from('rabbits').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('daily_logs').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
  ])

  let rabbits = (rabbitRows ?? []).map(dbToRabbit)
  if (rabbits.length === 0) {
    const seeded = seedRabbit(null)
    await persistRabbits(userId, [seeded], seeded.id)
    return { rabbits: [seeded], activeId: seeded.id, logs: {} }
  }

  const logs: LogsMap = {}
  for (const row of logRows ?? []) {
    logs[row.rabbit_id + '|' + row.log_date] = dbToLog(row)
  }

  let activeId = settings?.active_rabbit_id ?? rabbits[0].id
  if (!rabbits.find((r) => r.id === activeId)) activeId = rabbits[0].id

  return { rabbits, activeId, logs }
}

export async function persistRabbits(
  userId: string,
  rabbits: Rabbit[],
  activeId: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) {
    saveMockRabbits(userId, rabbits)
    if (activeId) saveMockActive(userId, activeId)
    return
  }
  const supabase = getSupabase()!
  const payload = rabbits.map((r) => rabbitToDb(r, userId))
  const { error } = await supabase.from('rabbits').upsert(payload, { onConflict: 'id' })
  if (error) console.error('persistRabbits', error)

  await supabase.from('user_settings').upsert({
    user_id: userId,
    active_rabbit_id: activeId,
  })
}

export async function persistLogs(userId: string, logs: LogsMap): Promise<void> {
  if (!isSupabaseConfigured) {
    saveMockLogs(userId, logs)
    return
  }
  const supabase = getSupabase()!
  const rows = Object.entries(logs).map(([key, log]) => {
    const [rabbit_id, log_date] = key.split('|')
    return {
      user_id: userId,
      rabbit_id,
      log_date,
      appetite: log.appetite || null,
      poop: log.poop || null,
      activity: log.activity || null,
      weight: log.weight,
      teeth: log.teeth || null,
      pain: log.pain || null,
      notes: log.notes || null,
    }
  })
  if (rows.length === 0) return
  const { error } = await supabase.from('daily_logs').upsert(rows, {
    onConflict: 'rabbit_id,log_date',
  })
  if (error) console.error('persistLogs', error)
}

export async function persistSingleLog(
  userId: string,
  rabbitId: string,
  date: Date,
  log: DailyLog,
): Promise<void> {
  const key = logKey(rabbitId, date)
  if (!isSupabaseConfigured) {
    const state = loadMockState(userId)
    state.logs[key] = log
    saveMockLogs(userId, state.logs)
    return
  }
  const supabase = getSupabase()!
  const { error } = await supabase.from('daily_logs').upsert({
    user_id: userId,
    rabbit_id: rabbitId,
    log_date: key.split('|')[1],
    appetite: log.appetite || null,
    poop: log.poop || null,
    activity: log.activity || null,
    weight: log.weight,
    teeth: log.teeth || null,
    pain: log.pain || null,
    notes: log.notes || null,
  })
  if (error) console.error('persistSingleLog', error)
}

export async function deleteRabbitRemote(userId: string, rabbitId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const supabase = getSupabase()!
  await supabase.from('rabbits').delete().eq('id', rabbitId).eq('user_id', userId)
}

export function createNewRabbit(name: string, rabbits: Rabbit[]): Rabbit | null {
  if (rabbits.length >= MAX_RABBITS) return null
  return {
    id: uid(),
    name: name.slice(0, 12),
    ageLabel: '年齡未填',
    breed: '',
    weight: null,
    avatar: null,
    tags: [
      { label: '食慾待記', style: '' },
      { label: '便便待記', style: '' },
      { label: '活動待記', style: '' },
      { label: '體重待記', style: '' },
    ],
    notes:
      '食慾 · 便便形狀與數量 · 活動量 · 牙齒磨損 · 體重變化 · 痛楚跡象',
    customTopics: [],
    diaryTitle: '兔子日記',
  }
}

export { isSupabaseConfigured }
