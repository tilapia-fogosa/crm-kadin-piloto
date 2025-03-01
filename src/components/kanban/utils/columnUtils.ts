
import { format } from "date-fns"

export const transformClientsToColumnData = (clients: any[] | null) => {
  console.log('transformClientsToColumnData received clients:', clients?.length)
  
  // Filtra clientes com status "matriculado" ou "perdido"
  const filteredClients = clients?.filter(client => 
    client.status !== 'matriculado' && client.status !== 'perdido'
  )
  
  console.log('Clients after status filtering:', filteredClients?.length)

  const columns = [
    {
      id: "novo-cadastro",
      title: "Novo Cadastro",
      cards: filteredClients
        ?.filter(client => {
          const isInColumn = client.status === 'novo-cadastro'
          if (client.id === '782daee7-d994-41d9-becc-5f5ef236cef3') {
            console.log('Mapeamento do cliente Jerri para card:', {
              original_ad: client.original_ad,
              original_adset: client.original_adset
            })
          }
          return isInColumn
        })
        .map(client => {
          const card = {
            id: client.id,
            clientName: client.name,
            leadSource: client.lead_source,
            phoneNumber: client.phone_number,
            createdAt: client.created_at,
            nextContactDate: client.next_contact_date,
            activities: client.client_activities || [],
            original_ad: client.original_ad,
            original_adset: client.original_adset,
            observations: client.observations
          }
          if (client.id === '782daee7-d994-41d9-becc-5f5ef236cef3') {
            console.log('Card final do cliente Jerri:', card)
          }
          return card
        }) || [],
    },
    {
      id: "tentativa-contato",
      title: "Em tentativa de Contato",
      cards: filteredClients
        ?.filter(client => client.status === 'tentativa-contato')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          nextContactDate: client.next_contact_date,
          activities: client.client_activities || [],
          original_ad: client.original_ad,
          original_adset: client.original_adset,
          observations: client.observations
        })) || [],
    },
    {
      id: "contato-efetivo",
      title: "Contato Efetivo",
      cards: filteredClients
        ?.filter(client => client.status === 'contato-efetivo')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          nextContactDate: client.next_contact_date,
          activities: client.client_activities || [],
          original_ad: client.original_ad,
          original_adset: client.original_adset,
          observations: client.observations
        })) || [],
    },
    {
      id: "atendimento-agendado",
      title: "Atendimento Agendado",
      cards: filteredClients
        ?.filter(client => client.status === 'atendimento-agendado')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          nextContactDate: client.next_contact_date,
          activities: client.client_activities || [],
          original_ad: client.original_ad,
          original_adset: client.original_adset,
          observations: client.observations
        })) || [],
    },
    {
      id: "atendimento-realizado",
      title: "Atendimento Realizado",
      cards: filteredClients
        ?.filter(client => client.status === 'atendimento-realizado' || client.status === 'negociacao')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          createdAt: client.created_at,
          nextContactDate: client.next_contact_date,
          activities: client.client_activities || [],
          original_ad: client.original_ad,
          original_adset: client.original_adset,
          observations: client.observations
        })) || [],
    },
  ]

  // Log final column counts
  columns.forEach(column => {
    console.log(`Column ${column.title} has ${column.cards.length} cards`)
  })

  return columns
}
