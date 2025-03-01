
import { KanbanCard } from "../types"

export interface PedagogicalKanbanCard extends KanbanCard {
  kit_type?: string
  kit_version?: string
  class_name?: string
  schedule_date?: string
  pedagogical_status?: 'pendente' | 'kit_selecionado' | 'turma_atribuida' | 'aula_agendada' | 'em_aula'
}

export interface PedagogicalColumn {
  id: string
  title: string
  cards: PedagogicalKanbanCard[]
}

export interface StudentKit {
  kit_type_id: string
  kit_version_id: string
  student_id: string
}

export interface StudentClass {
  class_id: string
  student_id: string
  start_date: Date
}

export interface PedagogicalSchedule {
  student_id: string
  class_id: string
  schedule_date: Date
  observations?: string
}
