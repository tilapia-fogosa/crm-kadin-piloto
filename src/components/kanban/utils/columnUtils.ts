
import { ClientData, ColumnDefinition, ClientSummaryData } from "./types/kanbanTypes"
import { transformClientToCard } from "./transforms/clientTransforms"
import { KanbanColumn } from "../types"

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    id: 'novo-cadastro',
    title: 'Novos Cadastros',
    filterPredicate: (client: ClientSummaryData) => client.status === 'novo-cadastro'
  },
  {
    id: 'tentativa-contato',
    title: 'Tentativa de Contato',
    filterPredicate: (client: ClientSummaryData) => client.status === 'tentativa-contato'
  },
  {
    id: 'contato-efetivo',
    title: 'Contato Efetivo',
    filterPredicate: (client: ClientSummaryData) => client.status === 'contato-efetivo'
  },
  {
    id: 'atendimento-agendado',
    title: 'Agendamento',
    filterPredicate: (client: ClientSummaryData) => client.status === 'atendimento-agendado'
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    filterPredicate: (client: ClientSummaryData) => client.status === 'negociacao'
  }
  // Apenas 5 colunas: após atendimento o cliente vai para negociação, matrícula ou perdido
  // Matriculados e perdidos não aparecem no kanban
]

export function transformClientsToColumnData(clients: ClientSummaryData[]): KanbanColumn[] {
  console.log('Transformando clientes para dados de coluna:', clients.length, 'clientes')
  
  const columns: KanbanColumn[] = COLUMN_DEFINITIONS.map(definition => {
    const filteredClients = clients.filter(definition.filterPredicate)
    console.log(`Coluna ${definition.title}: ${filteredClients.length} clientes`)
    
    return {
      id: definition.id,
      title: definition.title,
      cards: filteredClients.map(transformClientToCard)
    }
  })

  return columns
}

export function transformInfiniteClientsToColumnData(
  allPages: ClientSummaryData[][],
  minPerColumn: number = 100
): KanbanColumn[] {
  // Flatten all pages into a single array
  const allClients = allPages.flat()
  
  console.log('Transformando clientes infinitos para dados de coluna:', allClients.length, 'clientes')
  
  const columns: KanbanColumn[] = COLUMN_DEFINITIONS.map(definition => {
    const filteredClients = allClients.filter(definition.filterPredicate)
    console.log(`Coluna ${definition.title}: ${filteredClients.length} clientes`)
    
    return {
      id: definition.id,
      title: definition.title,
      cards: filteredClients.map(transformClientToCard)
    }
  })

  // Log column statistics
  const activeCounts = columns
    .filter(col => col.cards.length > 0)
    .map(col => ({ title: col.title, count: col.cards.length }))
  
  console.log('Distribuição por coluna ativa (apenas status ativos do funil):', activeCounts)
  
  return columns
}

export function shouldLoadMore(columns: KanbanColumn[], minPerColumn: number = 100): boolean {
  const activeColumns = columns.filter(col => col.cards.length > 0)
  
  if (activeColumns.length === 0) return true
  
  const hasColumnWithFewItems = activeColumns.some(col => col.cards.length < minPerColumn)
  
  console.log('Verificando se deve carregar mais:', {
    activeColumns: activeColumns.length,
    hasColumnWithFewItems,
    minPerColumn
  })
  
  return hasColumnWithFewItems
}
