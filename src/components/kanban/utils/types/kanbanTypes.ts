
import { KanbanColumn, KanbanCard } from "../../types"

export interface ClientData {
  id: string
  name: string
  lead_source: string
  phone_number: string
  created_at: string
  next_contact_date?: string
  client_activities?: string[]
  original_ad?: string
  original_adset?: string
  observations?: string
  status: string
}

export interface ColumnDefinition {
  id: string
  title: string
  filterPredicate: (client: ClientData) => boolean
}

