
import { ClientData } from "../types/kanbanTypes"
import { KanbanCard } from "../../types"
import { format } from "date-fns"

export const transformClientToCard = (client: ClientData) => {
  console.log(`Transformando cliente ${client.name} para card`)
  console.log(`Cliente ${client.id} - scheduled_date: ${client.scheduled_date}, valorização confirmada: ${client.valorization_confirmed}`)
  console.log(`Cliente ${client.id} - unit_id: ${client.unit_id}, unit_name: ${client.units?.name}`)
  
  return {
    id: client.id,
    clientName: client.name,
    leadSource: client.lead_source,
    phoneNumber: client.phone_number,
    email: client.email,
    createdAt: client.created_at,
    nextContactDate: client.next_contact_date,
    scheduledDate: client.scheduled_date,
    activities: client.client_activities || [],
    original_ad: client.original_ad,
    original_adset: client.original_adset,
    observations: client.observations,
    valorizationConfirmed: client.valorization_confirmed || false,
    unitId: client.unit_id,
    unitName: client.units?.name
  }
}
