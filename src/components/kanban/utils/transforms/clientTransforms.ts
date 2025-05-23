
export const transformClientToCard = (client: any) => {
  console.log(`Transformando cliente ${client.name} para card`)
  console.log(`Cliente ${client.id} - scheduled_date: ${client.scheduled_date}, valorização confirmada: ${client.valorization_confirmed}`)
  console.log(`Cliente ${client.id} - unit_id: ${client.unit_id}, unit_name: ${client.unit_name}`)
  console.log(`Cliente ${client.id} - registration_name: ${client.registration_name || 'não definido'}`)
  
  // Processar a última atividade se existir
  let activities: string[] = []
  if (client.last_activity) {
    const activity = client.last_activity
    const activityString = `${activity.tipo_atividade}|${activity.tipo_contato}|${activity.created_at}|${activity.notes || ''}|${activity.id}|${activity.next_contact_date || ''}|true`
    activities = [activityString]
  }
  
  return {
    id: client.id,
    clientName: client.name,
    leadSource: client.lead_source,
    phoneNumber: client.phone_number,
    email: client.email,
    createdAt: client.created_at,
    nextContactDate: client.next_contact_date,
    scheduledDate: client.scheduled_date,
    activities: activities,
    original_ad: client.original_ad,
    original_adset: client.original_adset,
    observations: client.observations,
    valorizationConfirmed: client.valorization_confirmed || false,
    registrationName: client.registration_name,
    unitId: client.unit_id,
    unitName: client.unit_name
  }
}
