
import { ColumnDefinition } from "../types/kanbanTypes"

export const PEDAGOGICAL_KANBAN_COLUMNS: ColumnDefinition[] = [
  {
    id: "pendente",
    title: "Pendente Kit/Turma",
    filterPredicate: client => 
      client.status === 'matriculado' && 
      (!client.kit_versions?.length || !client.classes?.length)
  },
  {
    id: "kit_selecionado",
    title: "Kit Selecionado",
    filterPredicate: client => 
      client.status === 'matriculado' && 
      client.kit_versions?.length > 0 && 
      !client.classes?.length
  },
  {
    id: "turma_atribuida",
    title: "Turma Atribuída",
    filterPredicate: client => 
      client.status === 'matriculado' && 
      client.kit_versions?.length > 0 && 
      client.classes?.length > 0 &&
      !client.pedagogical_schedules?.length
  },
  {
    id: "aula_agendada",
    title: "Aula Agendada",
    filterPredicate: client => 
      client.status === 'matriculado' && 
      client.pedagogical_schedules?.some(ps => ps.status === 'agendado')
  },
  {
    id: "em_aula",
    title: "Em Aula",
    filterPredicate: client => 
      client.status === 'matriculado' && 
      client.pedagogical_schedules?.some(ps => ps.status === 'em_andamento')
  }
]
