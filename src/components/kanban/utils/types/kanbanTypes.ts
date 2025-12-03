
import { KanbanColumn, KanbanCard } from "../../types"

export interface ClientData {
  id: string
  name: string
  lead_source: string
  phone_number: string
  email?: string
  created_at: string
  next_contact_date?: string
  scheduled_date?: string 
  client_activities?: string[]
  original_ad?: string
  original_adset?: string
  observations?: string
  status: string
  valorization_confirmed?: boolean
  registration_name?: string
  unit_id: string
  units?: {
    id: string
    name: string
  }
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

export interface ClientSummaryData {
  id: string
  name: string
  phone_number: string
  email?: string
  lead_source: string
  status: string
  next_contact_date?: string
  scheduled_date?: string
  unit_id: string
  valorization_confirmed?: boolean
  registration_name?: string
  original_ad?: string
  original_adset?: string
  observations?: string
  created_at: string
  unit_name?: string
  last_activity?: {
    id: string
    tipo_atividade: string
    tipo_contato: string
    notes?: string
    created_at: string
    next_contact_date?: string
    created_by?: string
  }
  /** Número de vezes que o cliente se cadastrou */
  quantidade_cadastros?: number
  /** Histórico das datas de cadastro do cliente */
  historico_cadastros?: string
}

export interface ActivityData {
  id: string
  tipo_atividade: string
  tipo_contato: string
  notes?: string
  created_at: string
  next_contact_date?: string
  created_by?: string
  author_name?: string
  client_id: string
  scheduled_date?: string
  active: boolean
}

export interface PaginatedClientData {
  clients: ClientSummaryData[]
  totalCount: number
  hasNextPage: boolean
  currentPage: number
}

export interface PaginatedActivitiesData {
  activities: ActivityData[]
  hasNextPage: boolean
  currentPage: number
}

export interface ColumnDefinition {
  id: string
  title: string
  filterPredicate: (client: ClientData) => boolean
}
