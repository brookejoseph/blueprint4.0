
export type User = {
  id: number
  name: string
  age: number
  weight?: number
  height?: number
  gender: string
  improvement_areas: any[]
  budget: string
  equipment: any[]
  current_health: any
  created_at?: string
}

export type ProtocolSection = {
  id: number
  section_id: string
  title: string
  content: string
  categories: any[]
  url: string
  created_at?: string
}

export type Routine = {
  id: number
  user_id: number
  supplements: any[]
  diet: any[]
  exercise: any[]
  sleep_schedule: any[]
  metrics: any
  protocol_links: any
  embedded_sections: any[]
  created_at?: string
}

export type Metric = {
  id: number
  user_id: number
  date: string
  weight?: number
  sleep_hours?: number
  steps?: number
  supplements?: any
  created_at?: string
}
