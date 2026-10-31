import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { useTracker } from '../context/TrackerProvider'
import { nextDefaultName } from '../lib/trackerUtils'
import { NameModal } from './modals/NameModal'
import { Toast } from './Toast'
import { CalendarScreen } from './screens/CalendarScreen'
import { LogScreen } from './screens/LogScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { TodayScreen } from './screens/TodayScreen'

type Screen = 'today' | 'log' | 'calendar' | 'profile'

export function TrackerApp() {
  const { signOut, user } = useAuth()
  const { loading, toast, activeRabbit, rabbits, addRabbit, renameActive, updateActiveAvatar } =
    useTracker()
  const [screen, setScreen] = useState<Screen>('today')
  const [logFocus, setLogFocus] = useState<string | null>(null)
  const [nameModal, setNameModal] = useState<{ open: boolean; mode: 'add' | 'rename' }>({
    open: false,
    mode: 'add',
  })
  const avatarRef = useRef<HTMLInputElement>(null)

  function goToLog(focus?: string) {
    setLogFocus(focus ?? null)
    setScreen('log')
  }

  function openAvatarPicker() {
    avatarRef.current?.click()
  }

  function onAvatarFile() {
    const file = avatarRef.current?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') updateActiveAvatar(reader.result)
      if (avatarRef.current) avatarRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="auth-screen">
        <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>載入中…</p>
      </div>
    )
  }

  return (
    <>
      <div className="app">
        <div className="auth-header-bar">
          <button type="button" className="btn-sign-out" onClick={() => signOut()}>
            登出
          </button>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />

        <div id="screen-today" className={'screen' + (screen === 'today' ? ' active' : '')}>
          <TodayScreen
            onFillStatus={() => goToLog()}
            onQuickEdit={(f) => goToLog(f)}
            onOpenAvatar={openAvatarPicker}
          />
        </div>
        <div id="screen-log" className={'screen' + (screen === 'log' ? ' active' : '')}>
          <LogScreen focusField={logFocus} />
        </div>
        <div id="screen-calendar" className={'screen' + (screen === 'calendar' ? ' active' : '')}>
          <CalendarScreen />
        </div>
        <div id="screen-profile" className={'screen' + (screen === 'profile' ? ' active' : '')}>
          <ProfileScreen
            onAddRabbit={() => setNameModal({ open: true, mode: 'add' })}
            onRename={() => setNameModal({ open: true, mode: 'rename' })}
          />
        </div>
      </div>

      <div className="bottom-nav">
        {(
          [
            ['today', '⌂', '今日'],
            ['log', '✎', '記錄'],
            ['calendar', '📅', '日曆'],
            ['profile', '👤', '檔案'],
          ] as const
        ).map(([id, icon, label]) => (
          <div
            key={id}
            className={'nav-item' + (screen === id ? ' active' : '')}
            onClick={() => setScreen(id)}
          >
            <div className="nav-icon">{icon}</div>
            {label}
          </div>
        ))}
      </div>

      <NameModal
        open={nameModal.open}
        mode={nameModal.mode}
        rabbits={rabbits}
        initialName={
          nameModal.mode === 'add' ? nextDefaultName(rabbits) : activeRabbit.name
        }
        onClose={() => setNameModal({ ...nameModal, open: false })}
        onConfirm={(name) => {
          if (nameModal.mode === 'add') addRabbit(name)
          else renameActive(name)
          setNameModal({ ...nameModal, open: false })
        }}
      />

      <Toast message={toast} />
      {user && (
        <span style={{ display: 'none' }} aria-hidden>
          {user.email}
        </span>
      )}
    </>
  )
}
