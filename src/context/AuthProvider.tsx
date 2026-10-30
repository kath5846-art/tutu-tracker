import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserSession } from '../types'
import {
  getMockSession,
  mockSignIn,
  mockSignOut,
  mockSignUp,
} from '../lib/mockAuth'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

interface AuthContextValue {
  user: UserSession | null
  loading: boolean
  isMockMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const isMockMode = !isSupabaseConfigured

  useEffect(() => {
    if (isMockMode) {
      setUser(getMockSession())
      setLoading(false)
      return
    }
    const supabase = getSupabase()!
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      if (s?.user) {
        setUser({ id: s.user.id, email: s.user.email ?? '' })
      }
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' })
      } else {
        setUser(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [isMockMode])

  const signIn = useCallback(async (email: string, password: string) => {
    if (isMockMode) {
      setUser(await mockSignIn(email, password))
      return
    }
    const { error } = await getSupabase()!.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [isMockMode])

  const signUp = useCallback(async (email: string, password: string) => {
    if (isMockMode) {
      setUser(await mockSignUp(email, password))
      return
    }
    const { error } = await getSupabase()!.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }, [isMockMode])

  const signOut = useCallback(async () => {
    if (isMockMode) {
      mockSignOut()
      setUser(null)
      return
    }
    await getSupabase()!.auth.signOut()
    setUser(null)
  }, [isMockMode])

  const sendMagicLink = useCallback(async (email: string) => {
    if (isMockMode) {
      await mockSignIn(email, 'devmode')
      setUser(getMockSession())
      return
    }
    const { error } = await getSupabase()!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw new Error(error.message)
  }, [isMockMode])

  const value = useMemo(
    () => ({ user, loading, isMockMode, signIn, signUp, signOut, sendMagicLink }),
    [user, loading, isMockMode, signIn, signUp, signOut, sendMagicLink],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
