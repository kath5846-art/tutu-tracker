import { useMemo } from 'react'
import { useTracker } from '../../context/TrackerProvider'
import { toDateKey, weekSummaryFromLog } from '../../lib/trackerUtils'

export function CalendarScreen() {
  const { activeId, getLog, viewDate } = useTracker()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startPad = (first.getDay() + 6) % 7
    const days: (number | null)[] = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(d)
    return {
      cells: days,
      monthLabel: `${year}年${month + 1}月`,
    }
  }, [year, month])

  const recent = useMemo(() => {
    if (!activeId) return []
    const out: { key: string; label: string; summary: string }[] = []
    for (let i = 0; i < 60 && out.length < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const log = getLog(activeId, d)
      if (log && (log.appetite || log.poop || log.activity)) {
        out.push({
          key: toDateKey(d),
          label: d.getMonth() + 1 + '/' + d.getDate(),
          summary: weekSummaryFromLog(log),
        })
      }
    }
    return out
  }, [activeId, getLog, now])

  return (
    <>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 24, fontWeight: 500 }}>
          日曆
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-soft)', marginTop: 4 }}>{monthLabel}</div>
      </header>
      <div className="calendar">
        <div className="cal-grid">
          {['一', '二', '三', '四', '五', '六', '日'].map((w) => (
            <div key={w} className="cal-day">
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day == null) return <div key={'e' + i} className="cal-day" />
            const d = new Date(year, month, day)
            const has = activeId && !!getLog(activeId, d)
            const isToday =
              d.getFullYear() === viewDate.getFullYear() &&
              d.getMonth() === viewDate.getMonth() &&
              d.getDate() === viewDate.getDate()
            return (
              <div
                key={i}
                className={
                  'cal-day' +
                  (has ? ' has-record' : '') +
                  (isToday ? ' today' : '')
                }
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>
      <div className="section-title">最近記錄</div>
      <div className="week-list">
        {recent.length === 0 ? (
          <div className="week-item">
            <div className="week-day">—</div>
            <div className="week-summary">尚無記錄</div>
          </div>
        ) : (
          recent.map((r) => (
            <div key={r.key} className="week-item">
              <div className="week-day">{r.label}</div>
              <div className="week-summary">{r.summary}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
