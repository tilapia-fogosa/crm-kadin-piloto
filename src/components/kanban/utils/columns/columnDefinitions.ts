
import { ColumnDefinition } from "../types/kanbanTypes"

export const KANBAN_COLUMNS: ColumnDefinition[] = [
  {
    id: "novo-cadastro",
    title: "Novo Cadastro",
    filterPredicate: client => client.status === 'novo-cadastro'
  },
  {
    id: "tentativa-contato",
    title: "Em tentativa de Contato",
    filterPredicate: client => client.status === 'tentativa-contato'
  },
  {
    id: "contato-efetivo",
    title: "Contato Efetivo",
    filterPredicate: client => client.status === 'contato-efetivo'
  },
  {
    id: "atendimento-agendado",
    title: "Atendimento Agendado",
    filterPredicate: client => client.status === 'atendimento-agendado'
  },
  {
    id: "negociacao",
    title: "Negociação",
    filterPredicate: client => client.status === 'negociacao'
  }
  // Removida a coluna "atendimento-realizado" - após atendimento o cliente vai para negociação, matrícula ou perdido
]
