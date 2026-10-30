import { useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { isSupabaseConfigured } from '../lib/supabaseClient'

type Tab = 'login' | 'signup' | 'magic'

export function AuthScreen() {
  const { signIn, signUp, sendMagicLink, isMockMode } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (tab === 'login') await signIn(email, password)
      else if (tab === 'signup') await signUp(email, password)
      else {
        await sendMagicLink(email)
        setMagicSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <h1>兔兔 Tracker</h1>
        <p>高齡小動物每日觀察 · 侘寂記錄</p>
      </div>
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={'auth-tab' + (tab === 'login' ? ' active' : '')}
            onClick={() => { setTab('login'); setError(null); setMagicSent(false) }}
          >
            登入
          </button>
          <button
            type="button"
            className={'auth-tab' + (tab === 'signup' ? ' active' : '')}
            onClick={() => { setTab('signup'); setError(null); setMagicSent(false) }}
          >
            註冊
          </button>
          {!isMockMode && (
            <button
              type="button"
              className={'auth-tab' + (tab === 'magic' ? ' active' : '')}
              onClick={() => { setTab('magic'); setError(null); setMagicSent(false) }}
            >
              魔法連結
            </button>
          )}
        </div>
        {error && <div className="auth-error">{error}</div>}
        {magicSent ? (
          <p className="auth-hint">已寄出登入連結，請查收電郵。</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="auth-email">電郵</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {tab !== 'magic' && (
              <div className="form-group">
                <label htmlFor="auth-password">密碼</label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isMockMode ? '至少 6 字' : '••••••••'}
                  minLength={6}
                  required
                />
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={busy}>
              {tab === 'login' && '登入'}
              {tab === 'signup' && '建立帳號'}
              {tab === 'magic' && '寄送連結'}
            </button>
          </form>
        )}
        <p className="auth-hint">
          每位使用者擁有獨立的兔子檔案與每日記錄。
        </p>
      </div>
      {(isMockMode || !isSupabaseConfigured) && (
        <div className="auth-dev-banner">
          開發模式：未設定 Supabase，資料存於本機瀏覽器（mock 帳號）。
        </div>
      )}
    </div>
  )
}
