
import { format } from "date-fns"

export const transformClientsToColumnData = (clients: any[] | null) => {
  console.log('transformClientsToColumnData received clients:', clients?.length)
  
  const columns = [
    {
      id: "novo-cadastro",
      title: "Novo Cadastro",
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'novo-cadastro'
          console.log(`Client ${client.name} (${client.id}) - status: ${client.status}, isInColumn 'novo-cadastro': ${isInColumn}`)
          return isInColumn
        })
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          activities: client.client_activities || []
        })) || [],
    },
    {
      id: "tentativa-contato",
      title: "Em tentativa de Contato",
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'tentativa-contato'
          console.log(`Client ${client.name} (${client.id}) - status: ${client.status}, isInColumn 'tentativa-contato': ${isInColumn}`)
          return isInColumn
        })
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          activities: client.client_activities || []
        })) || [],
    },
    {
      id: "contato-efetivo",
      title: "Contato Efetivo",
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'contato-efetivo'
          console.log(`Client ${client.name} (${client.id}) - status: ${client.status}, isInColumn 'contato-efetivo': ${isInColumn}`)
          return isInColumn
        })
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          activities: client.client_activities || []
        })) || [],
    },
    {
      id: "atendimento-agendado",
      title: "Atendimento Agendado",
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'atendimento-agendado'
          console.log(`Client ${client.name} (${client.id}) - status: ${client.status}, isInColumn 'atendimento-agendado': ${isInColumn}`)
          return isInColumn
        })
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          activities: client.client_activities || []
        })) || [],
    },
    {
      id: "atendimento-realizado",
      title: "Atendimento Realizado",
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'atendimento-realizado'
          console.log(`Client ${client.name} (${client.id}) - status: ${client.status}, isInColumn 'atendimento-realizado': ${isInColumn}`)
          return isInColumn
        })
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          activities: client.client_activities || []
        })) || [],
    },
  ]

  // Log final column counts
  columns.forEach(column => {
    console.log(`Column ${column.title} has ${column.cards.length} cards`)
  })

  return columns
}
