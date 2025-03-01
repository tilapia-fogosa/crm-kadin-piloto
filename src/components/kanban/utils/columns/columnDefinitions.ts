
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
    id: "atendimento-realizado",
    title: "Atendimento Realizado",
    filterPredicate: client => 
      client.status === 'atendimento-realizado' || 
      client.status === 'negociacao'
  }
]

