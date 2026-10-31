import { useRef, useState } from 'react'
import { RabbitSwitcher } from '../RabbitSwitcher'
import { EditProfileModal } from '../modals/EditProfileModal'
import { useTracker } from '../../context/TrackerProvider'
import { deriveTagsFromLog } from '../../lib/trackerUtils'
import { DEFAULT_NOTES } from '../../lib/constants'

interface Props {
  onAddRabbit: () => void
  onRename: () => void
}

export function ProfileScreen({ onAddRabbit, onRename }: Props) {
  const {
    rabbits,
    activeId,
    setActiveId,
    activeRabbit,
    viewDate,
    getLog,
    updateActiveAvatar,
    saveEditProfile,
  } = useTracker()
  const [editOpen, setEditOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const todayLog = activeId ? getLog(activeId, viewDate) : null
  const tags = deriveTagsFromLog(todayLog)
  const weightShow =
    todayLog && todayLog.weight != null
      ? todayLog.weight
      : activeRabbit.weight != null
        ? activeRabbit.weight
        : null

  function pickAvatar() {
    fileRef.current?.click()
  }

  function onFileChange() {
    const file = fileRef.current?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') updateActiveAvatar(reader.result)
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Noto Serif TC', serif", fontSize: 24, fontWeight: 500 }}>
          兔兔檔案
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 4 }}>
          最多 5 隻 · 點選切換 · 可編輯基本資料
        </div>
      </header>

      <RabbitSwitcher
        rabbits={rabbits}
        activeId={activeId}
        onSelect={setActiveId}
        showAdd
        onAdd={onAddRabbit}
        onLongPressRename={() => onRename()}
        id="profileSwitcher"
      />

      <div className="profile-card">
        <div className="avatar-wrap" title="點擊更換照片" onClick={pickAvatar}>
          <div className={'avatar-circle' + (activeRabbit.avatar ? ' has-photo' : '')}>
            {activeRabbit.avatar && <img src={activeRabbit.avatar} alt="兔子頭像" />}
            <div className="avatar-placeholder">
              <span className="cam-icon">📷</span>
              <span>加入照片</span>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
        <button type="button" className="avatar-change" onClick={pickAvatar}>
          更換照片
        </button>
        <div className="profile-name">{activeRabbit.name}</div>
        <div className="profile-meta">
          {[activeRabbit.ageLabel, activeRabbit.breed].filter(Boolean).join(' · ') ||
            '尚未填寫品種／年齡'}
        </div>
        <div className="profile-meta" style={{ marginTop: 6 }}>
          {weightShow != null ? `目前體重 ${weightShow} kg` : '目前體重尚未記錄'}
        </div>
        <div className="status-tags">
          {tags.map((t) => (
            <span key={t.label} className={'status-tag' + (t.style ? ' ' + t.style : '')}>
              {t.label}
            </span>
          ))}
        </div>
        <button type="button" className="btn-edit-profile" onClick={() => setEditOpen(true)}>
          編輯資料
        </button>
      </div>

      <div className="metric-card" style={{ cursor: 'default' }}>
        <div className="metric-title">觀察重點</div>
        <div className="metric-note" style={{ marginTop: 8 }}>
          {activeRabbit.notes || DEFAULT_NOTES}
        </div>
      </div>
      <div className="section-title">提醒</div>
      <div className="week-list">
        <div className="week-item">
          <div className="week-day">每週稱重</div>
          <div className="week-summary">建議固定時間</div>
        </div>
        <div className="week-item">
          <div className="week-day">牙齒檢查</div>
          <div className="week-summary">每月一次</div>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        rabbit={activeRabbit}
        onClose={() => setEditOpen(false)}
        onSave={saveEditProfile}
      />
    </>
  )
}
