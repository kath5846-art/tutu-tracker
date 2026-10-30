import type { UserSession } from '../types'

const USERS_KEY = 'tutu-mock-users'
const SESSION_KEY = 'tutu-mock-session'

interface MockUser {
  id: string
  email: string
  password: string
}

function loadUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getMockSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setMockSession(session: UserSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export async function mockSignUp(email: string, password: string): Promise<UserSession> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || password.length < 6) {
    throw new Error('請使用有效電郵，密碼至少 6 字')
  }
  const users = loadUsers()
  if (users.some((u) => u.email === normalized)) {
    throw new Error('此電郵已註冊')
  }
  const user: MockUser = {
    id: 'mock_' + Date.now().toString(36),
    email: normalized,
    password,
  }
  users.push(user)
  saveUsers(users)
  const session = { id: user.id, email: user.email }
  setMockSession(session)
  return session
}

export async function mockSignIn(email: string, password: string): Promise<UserSession> {
  const normalized = email.trim().toLowerCase()
  const user = loadUsers().find((u) => u.email === normalized)
  if (!user || user.password !== password) {
    throw new Error('電郵或密碼不正確')
  }
  const session = { id: user.id, email: user.email }
  setMockSession(session)
  return session
}

export function mockSignOut() {
  setMockSession(null)
}
