import { useRef } from 'react'
import { RabbitSwitcher } from '../RabbitSwitcher'
import { useTracker } from '../../context/TrackerProvider'
import { MAX_CUSTOM_TOPICS } from '../../lib/constants'
import {
  buildSummary,
  dateLabelFor,
  deriveTagsFromLog,
  formatDisplayDate,
  isSameDay,
  startOfWeek,
  statusClassFor,
  statusLabelFor,
  weekSummaryFromLog,
} from '../../lib/trackerUtils'

interface Props {
  onFillStatus: () => void
  onQuickEdit: (field: string) => void
  onOpenAvatar: () => void
}

export function TodayScreen({ onFillStatus, onQuickEdit, onOpenAvatar }: Props) {
  const {
    activeRabbit,
    rabbits,
    activeId,
    setActiveId,
    viewDate,
    setViewDate,
    getLog,
    commitDiaryTitle,
    updateCustomTopics,
    showToast,
  } = useTracker()

  const diaryRef = useRef<HTMLSpanElement>(null)
  const log = activeId ? getLog(activeId, viewDate) : null
  const summary = buildSummary(log)
  const tags = deriveTagsFromLog(log)

  const mon = startOfWeek(viewDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i)
    return d
  })

  function changeWeek(delta: number) {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate() + delta * 7),
    )
  }

  const w =
    log && log.weight != null
      ? log.weight
      : activeRabbit.weight != null
        ? activeRabbit.weight
        : null

  const weekObservations = weekDays
    .slice()
    .reverse()
    .filter((d) => activeId && getLog(activeId, d))
    .slice(0, 4)
    .map((d) => ({
      d,
      text: weekSummaryFromLog(activeId ? getLog(activeId, d) : null),
    }))

  return (
    <>
      <div className="today-title-bar">
        <span
          ref={diaryRef}
          className="diary-title"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          data-placeholder="兔子日記"
          title="點一下即可修改題目"
          onBlur={() => {
            const t = (diaryRef.current?.textContent ?? '').trim() || '兔子日記'
            commitDiaryTitle(t)
            if (diaryRef.current) diaryRef.current.textContent = t.slice(0, 24)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              diaryRef.current?.blur()
            }
          }}
        >
          {activeRabbit.diaryTitle}
        </span>
      </div>

      <div
        className={'today-hero' + (activeRabbit.avatar ? ' has-photo' : '')}
        title="點擊更換／加入照片"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.rabbit-chip')) return
          onOpenAvatar()
        }}
      >
        {activeRabbit.avatar && (
          <img className="today-hero-img" src={activeRabbit.avatar} alt="兔子照片" />
        )}
        <div className="today-hero-placeholder">
          <span className="ph-icon">📷</span>
          <span className="ph-text">點擊加入兔兔照片</span>
        </div>
        <RabbitSwitcher
          rabbits={rabbits}
          activeId={activeId}
          onSelect={setActiveId}
          className="compact on-hero"
          id="todaySwitcher"
        />
        <div className="today-hero-overlay">
          <div className="today-hero-glass">
            <div className="today-hero-name">{activeRabbit.name}</div>
            <div className="today-hero-age">
              {[activeRabbit.ageLabel, activeRabbit.breed].filter(Boolean).join(' · ') ||
                '尚未填寫年齡／品種'}
            </div>
          </div>
          <div className="today-hero-tags">
            {tags.map((t) => (
              <span key={t.label} className={'status-tag' + (t.style ? ' ' + t.style : '')}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <CustomTopics
        topics={activeRabbit.customTopics}
        onChange={updateCustomTopics}
        showToast={showToast}
      />

      <div className="week-strip" aria-label="選擇日期">
        <button type="button" className="week-nav-btn" aria-label="上一週" onClick={() => changeWeek(-1)}>
          ‹
        </button>
        <div className="week-days">
          {weekDays.map((d, i) => {
            const labels = ['一', '二', '三', '四', '五', '六', '日']
            const has = activeId && !!getLog(activeId, d)
            return (
              <button
                key={i}
                type="button"
                className={
                  'week-day-btn' +
                  (isSameDay(d, viewDate) ? ' active' : '') +
                  (has ? ' has-log' : '')
                }
                onClick={() => setViewDate(new Date(d))}
              >
                <span>{labels[i]}</span>
                <span className="wd-num">{d.getDate()}</span>
              </button>
            )
          })}
        </div>
        <button type="button" className="week-nav-btn" aria-label="下一週" onClick={() => changeWeek(1)}>
          ›
        </button>
      </div>
      <div className="week-caption">
        {dateLabelFor(viewDate)} · {formatDisplayDate(viewDate)}
      </div>

      <div className={'summary-line' + (summary.alert ? ' alert' : '')}>{summary.text}</div>

      <div className="fill-cta-wrap">
        <button type="button" className="btn-fill-status" onClick={onFillStatus}>
          填寫今日狀態
        </button>
      </div>

      <div className="metrics">
        <MetricCard
          title="食慾"
          field="appetite"
          value={log?.appetite ?? ''}
          onClick={() => onQuickEdit('appetite')}
        />
        <MetricCard
          title="便便"
          field="poop"
          value={log?.poop ?? ''}
          onClick={() => onQuickEdit('poop')}
        />
        <MetricCard
          title="活動"
          field="activity"
          value={log?.activity ?? ''}
          onClick={() => onQuickEdit('activity')}
          hint={
            log?.activity && statusClassFor('activity', log.activity) === 'watch'
              ? log.notes || '活動偏少，可加備註觀察細節'
              : undefined
          }
        />
        <div className="metric-card" onClick={() => onQuickEdit('weight')}>
          <div className="metric-header">
            <div className="metric-title">體重</div>
            <div className={'metric-status' + (log?.weight != null ? ' good' : '')}>
              {log?.weight != null ? '已記' : '—'}
            </div>
          </div>
          <div className="metric-value">{w != null ? w + ' kg' : '—'}</div>
          <div className="metric-note">點擊可更新</div>
        </div>
      </div>

      <div className="trend-card">
        <div className="trend-title">
          <span>體重趨勢（近 8 週）</span>
          <span style={{ color: 'var(--text-soft)', fontSize: 13 }}>依記錄更新</span>
        </div>
        <svg className="trend-svg" viewBox="0 0 320 70" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FA18A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8FA18A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,48 L40,45 L80,42 L120,44 L160,38 L200,40 L240,36 L280,34 L320,32"
            fill="none"
            stroke="#6B7D66"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M0,48 L40,45 L80,42 L120,44 L160,38 L200,40 L240,36 L280,34 L320,32 L320,70 L0,70 Z"
            fill="url(#g)"
          />
        </svg>
        <div className="trend-note">持續記錄體重以查看趨勢</div>
      </div>

      <div className="section-title">本週觀察</div>
      <div className="week-list">
        {weekObservations.length === 0 ? (
          <div className="week-item">
            <div className="week-day">—</div>
            <div className="week-summary">本週尚無記錄</div>
          </div>
        ) : (
          weekObservations.map(({ d, text }) => (
            <div key={d.toISOString()} className="week-item">
              <div className="week-day">
                {d.getMonth() + 1}/{d.getDate()} {['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}
              </div>
              <div className="week-summary">{text}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function MetricCard({
  title,
  field,
  value,
  onClick,
  hint,
}: {
  title: string
  field: string
  value: string
  onClick: () => void
  hint?: string
}) {
  const sc = statusClassFor(field, value)
  return (
    <div className={'metric-card' + (sc === 'watch' ? ' watch' : '')} onClick={onClick}>
      <div className="metric-header">
        <div className="metric-title">{title}</div>
        <div className={'metric-status' + (sc ? ' ' + sc : '')}>
          {statusLabelFor(field, value)}
        </div>
      </div>
      <div className="metric-value">{value || '未記錄'}</div>
      <div className="metric-note">{value ? '' : '點擊填寫'}</div>
      {hint && <div className="metric-hint">{hint}</div>}
    </div>
  )
}

function CustomTopics({
  topics,
  onChange,
  showToast,
}: {
  topics: string[]
  onChange: (t: string[]) => void
  showToast: (m: string) => void
}) {
  return (
    <div className="custom-topics" aria-label="自訂題目">
      <div className="custom-topics-chips">
        {topics.map((label, idx) => (
          <span
            key={idx}
            className="topic-chip"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            title="點一下修改 · 清空刪除"
            onBlur={(e) => {
              const t = e.currentTarget.textContent?.trim() ?? ''
              const next = [...topics]
              if (!t) {
                next.splice(idx, 1)
                showToast('已刪除題目')
              } else {
                next[idx] = t.slice(0, 10)
              }
              onChange(next)
            }}
          >
            {label}
          </span>
        ))}
        {topics.length < MAX_CUSTOM_TOPICS && (
          <span
            className="topic-chip topic-slot"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="新題目"
            title="輸入新題目"
            onBlur={(e) => {
              const t = e.currentTarget.textContent?.trim() ?? ''
              if (t) onChange([...topics, t.slice(0, 10)])
              e.currentTarget.textContent = ''
            }}
          />
        )}
      </div>
    </div>
  )
}
