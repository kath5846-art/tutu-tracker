export type TagStyle = '' | 'good' | 'watch'

export interface StatusTag {
  label: string
  style: TagStyle
}

export interface Rabbit {
  id: string
  name: string
  ageLabel: string
  breed: string
  weight: number | null
  avatar: string | null
  tags: StatusTag[]
  notes: string
  customTopics: string[]
  diaryTitle: string
}

export interface DailyLog {
  appetite: string
  poop: string
  activity: string
  weight: number | null
  teeth: string
  pain: string
  notes: string
}

export type LogsMap = Record<string, DailyLog>

export interface UserSession {
  id: string
  email: string
}

export interface TrackerState {
  rabbits: Rabbit[]
  activeId: string | null
  logs: LogsMap
}
