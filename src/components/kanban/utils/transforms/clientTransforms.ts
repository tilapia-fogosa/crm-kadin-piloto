
import { ClientData } from "../types/kanbanTypes"
import { KanbanCard } from "../../types"

export const transformClientToCard = (client: ClientData) => {
  console.log(`Transformando cliente ${client.name} para card`)
  
  return {
    id: client.id,
    clientName: client.name,
    leadSource: client.lead_source,
    phoneNumber: client.phone_number,
    email: client.email,
    createdAt: client.created_at,
    nextContactDate: client.next_contact_date,
    activities: client.client_activities || [],
    original_ad: client.original_ad,
    original_adset: client.original_adset,
    observations: client.observations,
    valorizationConfirmed: client.valorization_confirmed || false
  }
}
