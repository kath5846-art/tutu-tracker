import { useEffect, useState } from 'react'
import { emptyLog, useTracker } from '../../context/TrackerProvider'
import { formatDisplayDate } from '../../lib/trackerUtils'
import type { DailyLog } from '../../types'

interface Props {
  focusField?: string | null
}

const FIELDS = [
  { key: 'appetite', label: '食慾', options: ['良好', '普通', '較少', '拒絕'] },
  { key: 'poop', label: '便便', options: ['正常', '較少', '偏軟', '異常'] },
  { key: 'activity', label: '活動', options: ['活躍', '普通', '稍減', '明顯減少'] },
  { key: 'teeth', label: '牙齒狀況', options: ['正常', '需留意', '已檢查'] },
  { key: 'pain', label: '痛楚 / 不適', options: ['無', '輕微', '明顯'] },
] as const

export function LogScreen({ focusField }: Props) {
  const { activeRabbit, activeId, viewDate, getLog, saveLog } = useTracker()
  const existing = activeId ? getLog(activeId, viewDate) : null
  const [form, setForm] = useState<DailyLog>(() => existing ?? emptyLog())

  useEffect(() => {
    const log = activeId ? getLog(activeId, viewDate) : null
    if (log) {
      setForm(log)
    } else {
      setForm({
        ...emptyLog(),
        weight: activeRabbit.weight,
      })
    }
  }, [activeId, viewDate, getLog, activeRabbit.weight])

  useEffect(() => {
    if (focusField) {
      const el = document.getElementById('field-' + focusField)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusField])

  function setField(key: keyof DailyLog, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    await saveLog({ ...form })
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 24, fontWeight: 500 }}>
          今日記錄
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-soft)', marginTop: 4 }}>
          {formatDisplayDate(viewDate)} · {activeRabbit.name}
        </div>
      </header>

      {FIELDS.map(({ key, label, options }) => (
        <div className="form-group" id={'field-' + key} key={key}>
          <label>{label}</label>
          <div className="options">
            {options.map((opt) => (
              <div
                key={opt}
                className={'option' + (form[key as keyof DailyLog] === opt ? ' selected' : '')}
                onClick={() => setField(key as keyof DailyLog, opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="form-group" id="field-weight">
        <label>體重 (kg)</label>
        <input
          type="number"
          step="0.1"
          placeholder="例如 2.4"
          value={form.weight ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setForm((f) => ({
              ...f,
              weight: v === '' ? null : Number(v),
            }))
          }}
        />
      </div>

      <div className="form-group">
        <label>備註</label>
        <textarea
          rows={3}
          placeholder="今日觀察到的細節…"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <button type="button" className="btn-primary" onClick={handleSave}>
        儲存今日記錄
      </button>
    </>
  )
}
