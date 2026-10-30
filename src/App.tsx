import { AuthProvider, useAuth } from './context/AuthProvider'
import { TrackerProvider } from './context/TrackerProvider'
import { AuthScreen } from './components/AuthScreen'
import { TrackerApp } from './components/TrackerApp'

function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-screen">
        <p style={{ textAlign: 'center', color: 'var(--text-soft)' }}>載入中…</p>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  return (
    <TrackerProvider>
      <TrackerApp />
    </TrackerProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
