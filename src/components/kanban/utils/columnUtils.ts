import { format } from "date-fns"

export const transformClientsToColumnData = (clients: any[] | null) => {
  console.log('transformClientsToColumnData received clients:', clients?.length)
  
  // Log detalhado para o cliente específico
  const jerriClient = clients?.find(client => client.id === '782daee7-d994-41d9-becc-5f5ef236cef3')
  if (jerriClient) {
    console.log('Dados do cliente Jerri:', {
      id: jerriClient.id,
      name: jerriClient.name,
      original_ad: jerriClient.original_ad,
      original_adset: jerriClient.original_adset
    })
  }
  
  const columns = [
    {
      id: "novo-cadastro",
      title: "Novo Cadastro",
      cards: clients
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
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'tentativa-contato'
          if (client.id === '782daee7-d994-41d9-becc-5f5ef236cef3') {
            console.log('Mapeamento do cliente Jerri para card (tentativa-contato):', {
              original_ad: client.original_ad,
              original_adset: client.original_adset
            })
          }
          return isInColumn
        })
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
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'contato-efetivo'
          return isInColumn
        })
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
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'atendimento-agendado'
          return isInColumn
        })
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
      cards: clients
        ?.filter(client => {
          const isInColumn = client.status === 'atendimento-realizado'
          return isInColumn
        })
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
    const jerriCard = column.cards.find(card => card.id === '782daee7-d994-41d9-becc-5f5ef236cef3')
    if (jerriCard) {
      console.log(`Cliente Jerri encontrado na coluna ${column.title}:`, {
        original_ad: jerriCard.original_ad,
        original_adset: jerriCard.original_adset
      })
    }
    console.log(`Column ${column.title} has ${column.cards.length} cards`)
  })

  return columns
}
