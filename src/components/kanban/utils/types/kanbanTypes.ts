
import { KanbanColumn, KanbanCard } from "../../types"

export interface ClientData {
  id: string
  name: string // snake_case como no banco
  lead_source: string
  phone_number: string
  email?: string // Adicionando campo de email
  created_at: string
  next_contact_date?: string
  client_activities?: string[]
  original_ad?: string
  original_adset?: string
  observations?: string
  status: string
  kit_versions?: {
    id: string
    kit_type: {
      id: string
      name: string
    }
    version: string
  }[]
  classes?: {
    id: string
    name: string
    schedule: string
  }[]
  pedagogical_schedules?: {
    id: string
    schedule_date: string
    status: string
    observations?: string
  }[]
}

export interface ColumnDefinition {
  id: string
  title: string
  filterPredicate: (client: ClientData) => boolean
}
