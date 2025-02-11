
import { format } from "date-fns"

export const transformClientsToColumnData = (clients: any[] | null) => {
  const columns = [
    {
      id: "novo-cadastro",
      title: "Novo Cadastro",
      cards: clients
        ?.filter(client => client.status === 'novo-cadastro')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map((activity: any) => {
            console.log('Processing activity:', activity);
            // Garantindo que o ID está presente e é uma string válida
            if (!activity.id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }).filter(Boolean), // Remove any null values from the array
        })) || [],
    },
    {
      id: "tentativa-contato",
      title: "Em tentativa de Contato",
      cards: clients
        ?.filter(client => client.status === 'tentativa-contato')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map((activity: any) => {
            console.log('Processing activity:', activity);
            if (!activity.id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }).filter(Boolean),
        })) || [],
    },
    {
      id: "contato-efetivo",
      title: "Contato Efetivo",
      cards: clients
        ?.filter(client => client.status === 'contato-efetivo')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map((activity: any) => {
            console.log('Processing activity:', activity);
            if (!activity.id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }).filter(Boolean),
        })) || [],
    },
    {
      id: "atendimento-agendado",
      title: "Atendimento Agendado",
      cards: clients
        ?.filter(client => client.status === 'atendimento-agendado')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map((activity: any) => {
            console.log('Processing activity:', activity);
            if (!activity.id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }).filter(Boolean),
        })) || [],
    },
    {
      id: "atendimento-realizado",
      title: "Atendimento Realizado",
      cards: clients
        ?.filter(client => client.status === 'atendimento-realizado')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map((activity: any) => {
            console.log('Processing activity:', activity);
            if (!activity.id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            return `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}`
          }).filter(Boolean),
        })) || [],
    },
  ]

  return columns
}
