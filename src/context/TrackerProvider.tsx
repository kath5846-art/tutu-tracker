import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DailyLog, Rabbit } from '../types'
import { DEFAULT_NOTES, MAX_CUSTOM_TOPICS } from '../lib/constants'
import {
  createNewRabbit,
  loadTrackerState,
  persistLogs,
  persistRabbits,
  persistSingleLog,
} from '../lib/dataService'
import {
  dateLabelFor,
  deriveTagsFromLog,
  emptyLog,
  logKey,
  nextDefaultName,
} from '../lib/trackerUtils'
import { useAuth } from './AuthProvider'

interface TrackerContextValue {
  loading: boolean
  rabbits: Rabbit[]
  activeId: string | null
  activeRabbit: Rabbit
  viewDate: Date
  setViewDate: (d: Date) => void
  setActiveId: (id: string) => void
  getLog: (rabbitId: string, d: Date) => DailyLog | null
  saveLog: (log: DailyLog) => Promise<void>
  addRabbit: (name: string) => boolean
  renameActive: (name: string) => void
  updateActiveAvatar: (dataUrl: string) => void
  saveEditProfile: (patch: Partial<Rabbit>) => void
  commitDiaryTitle: (title: string) => void
  updateCustomTopics: (topics: string[]) => void
  showToast: (msg: string) => void
  toast: string | null
}

const TrackerContext = createContext<TrackerContextValue | null>(null)

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rabbits, setRabbits] = useState<Rabbit[]>([])
  const [activeId, setActiveIdState] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, DailyLog>>({})
  const [viewDate, setViewDate] = useState(() => new Date())
  const [toast, setToast] = useState<string | null>(null)

  const userId = user?.id ?? ''

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    loadTrackerState(userId).then((state) => {
      setRabbits(state.rabbits)
      setActiveIdState(state.activeId)
      setLogs(state.logs)
      setLoading(false)
    })
  }, [userId])

  const persistAll = useCallback(
    async (nextRabbits: Rabbit[], nextActive: string | null, nextLogs?: Record<string, DailyLog>) => {
      await persistRabbits(userId, nextRabbits, nextActive)
      if (nextLogs) await persistLogs(userId, nextLogs)
    },
    [userId],
  )

  const activeRabbit = useMemo(() => {
    return rabbits.find((r) => r.id === activeId) ?? rabbits[0] ?? seedFallback()
  }, [rabbits, activeId])

  function seedFallback(): Rabbit {
    return {
      id: 'fallback',
      name: '兔兔',
      ageLabel: '',
      breed: '',
      weight: null,
      avatar: null,
      tags: [],
      notes: DEFAULT_NOTES,
      customTopics: [],
      diaryTitle: '兔子日記',
    }
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  const setActiveId = useCallback(
    (id: string) => {
      setActiveIdState(id)
      persistRabbits(userId, rabbits, id)
    },
    [userId, rabbits],
  )

  const getLog = useCallback(
    (rabbitId: string, d: Date) => {
      return logs[logKey(rabbitId, d)] ?? null
    },
    [logs],
  )

  const saveLog = useCallback(
    async (log: DailyLog) => {
      const r = activeRabbit
      const key = logKey(r.id, viewDate)
      const nextLogs = { ...logs, [key]: log }
      setLogs(nextLogs)
      const nextRabbits = rabbits.map((rb) =>
        rb.id === r.id
          ? {
              ...rb,
              weight: log.weight != null ? log.weight : rb.weight,
              tags: deriveTagsFromLog(log),
            }
          : rb,
      )
      setRabbits(nextRabbits)
      await persistSingleLog(userId, r.id, viewDate, log)
      await persistRabbits(userId, nextRabbits, activeId)
      showToast('已儲存「' + r.name + '」' + dateLabelFor(viewDate) + '狀態')
    },
    [activeRabbit, viewDate, logs, rabbits, userId, activeId, showToast],
  )

  const addRabbit = useCallback(
    (name: string) => {
      const trimmed = (name || '').trim() || nextDefaultName(rabbits)
      const created = createNewRabbit(trimmed, rabbits)
      if (!created) return false
      const next = [...rabbits, created]
      setRabbits(next)
      setActiveIdState(created.id)
      persistAll(next, created.id)
      return true
    },
    [rabbits, persistAll],
  )

  const renameActive = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const next = rabbits.map((r) =>
        r.id === activeId ? { ...r, name: trimmed.slice(0, 12) } : r,
      )
      setRabbits(next)
      persistAll(next, activeId)
    },
    [rabbits, activeId, persistAll],
  )

  const updateActiveAvatar = useCallback(
    (dataUrl: string) => {
      const next = rabbits.map((r) => (r.id === activeId ? { ...r, avatar: dataUrl } : r))
      setRabbits(next)
      persistAll(next, activeId)
    },
    [rabbits, activeId, persistAll],
  )

  const saveEditProfile = useCallback(
    (patch: Partial<Rabbit>) => {
      const next = rabbits.map((r) =>
        r.id === activeId
          ? {
              ...r,
              ...patch,
              name: (patch.name ?? r.name).slice(0, 12),
              ageLabel: (patch.ageLabel ?? r.ageLabel).slice(0, 24),
              breed: (patch.breed ?? r.breed).slice(0, 24),
            }
          : r,
      )
      setRabbits(next)
      persistAll(next, activeId)
      const r = next.find((x) => x.id === activeId)
      if (r) showToast('已更新「' + r.name + '」資料')
    },
    [rabbits, activeId, persistAll, showToast],
  )

  const commitDiaryTitle = useCallback(
    (title: string) => {
      let t = title.trim().slice(0, 24) || '兔子日記'
      const next = rabbits.map((r) => (r.id === activeId ? { ...r, diaryTitle: t } : r))
      setRabbits(next)
      persistAll(next, activeId)
    },
    [rabbits, activeId, persistAll],
  )

  const updateCustomTopics = useCallback(
    (topics: string[]) => {
      const cleaned = topics
        .map((t) => String(t || '').trim().slice(0, 10))
        .filter(Boolean)
        .slice(0, MAX_CUSTOM_TOPICS)
      const next = rabbits.map((r) =>
        r.id === activeId ? { ...r, customTopics: cleaned } : r,
      )
      setRabbits(next)
      persistAll(next, activeId)
    },
    [rabbits, activeId, persistAll],
  )

  const value = useMemo(
    () => ({
      loading,
      rabbits,
      activeId,
      activeRabbit,
      viewDate,
      setViewDate,
      setActiveId,
      getLog,
      saveLog,
      addRabbit,
      renameActive,
      updateActiveAvatar,
      saveEditProfile,
      commitDiaryTitle,
      updateCustomTopics,
      showToast,
      toast,
    }),
    [
      loading,
      rabbits,
      activeId,
      activeRabbit,
      viewDate,
      setViewDate,
      setActiveId,
      getLog,
      saveLog,
      addRabbit,
      renameActive,
      updateActiveAvatar,
      saveEditProfile,
      commitDiaryTitle,
      updateCustomTopics,
      showToast,
      toast,
    ],
  )

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}

export function useTracker() {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker outside TrackerProvider')
  return ctx
}

export { emptyLog }
