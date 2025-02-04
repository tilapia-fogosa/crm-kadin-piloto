
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
          activities: client.client_activities?.map((activity: any) => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
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
          activities: client.client_activities?.map((activity: any) => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
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
          activities: client.client_activities?.map((activity: any) => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
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
          activities: client.client_activities?.map((activity: any) => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
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
          activities: client.client_activities?.map((activity: any) => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
  ]

  return columns
}
