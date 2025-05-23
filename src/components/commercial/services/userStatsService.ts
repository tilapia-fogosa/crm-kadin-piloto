
import { supabase } from "@/integrations/supabase/client"

export interface UserStatsData {
  user_id: string
  user_name: string
  new_clients: number
  contact_attempts: number
  effective_contacts: number
  scheduled_visits: number
  awaiting_visits: number
  completed_visits: number
  enrollments: number
  ce_conversion_rate: number
  ag_conversion_rate: number
  at_conversion_rate: number
  ma_conversion_rate: number
}

export async function fetchUserStats(
  startDate: string,
  endDate: string,
  unitIds: string[],
  sourceId: string = 'todos'
): Promise<UserStatsData[]> {
  try {
    console.log('Fetching user stats:', { startDate, endDate, unitIds, sourceId })
    
    const { data, error } = await supabase.rpc('get_commercial_user_stats', {
      p_start_date: startDate,
      p_end_date: endDate,
      p_unit_ids: unitIds,
      p_source_id: sourceId
    })

    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }

    console.log('User stats data received:', data)

    if (!data || !Array.isArray(data)) {
      console.warn('No user stats data received or data is not an array')
      return []
    }

    // Map the RPC result to our interface
    return data.map(row => ({
      user_id: row.user_id,
      user_name: row.user_name,
      new_clients: Number(row.new_clients) || 0,
      contact_attempts: Number(row.contact_attempts) || 0,
      effective_contacts: Number(row.effective_contacts) || 0,
      scheduled_visits: Number(row.scheduled_visits) || 0,
      awaiting_visits: Number(row.awaiting_visits) || 0,
      completed_visits: Number(row.completed_visits) || 0,
      enrollments: Number(row.enrollments) || 0,
      ce_conversion_rate: Number(row.ce_conversion_rate) || 0,
      ag_conversion_rate: Number(row.ag_conversion_rate) || 0,
      at_conversion_rate: Number(row.at_conversion_rate) || 0,
      ma_conversion_rate: Number(row.ma_conversion_rate) || 0
    }))

  } catch (error) {
    console.error('Error in fetchUserStats:', error)
    throw error
  }
}

export async function fetchDetailedUserActivities(
  userId: string,
  startDate: string,
  endDate: string,
  unitIds: string[]
) {
  try {
    console.log('Fetching detailed user activities:', { userId, startDate, endDate, unitIds })
    
    // Get client activities for the user in the specified period
    const { data: activities, error: activitiesError } = await supabase
      .from('client_activities')
      .select(`
        id,
        tipo_atividade,
        tipo_contato,
        created_at,
        notes,
        client_id,
        clients (
          name,
          phone_number,
          email
        )
      `)
      .eq('created_by', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('unit_id', unitIds)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (activitiesError) {
      console.error('Error fetching user activities:', activitiesError)
      throw activitiesError
    }

    // Get clients created by the user in the specified period
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        phone_number,
        email,
        status,
        created_at
      `)
      .eq('created_by', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('unit_id', unitIds)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error('Error fetching user clients:', clientsError)
      throw clientsError
    }

    console.log('Detailed activities data:', { activities: activities?.length, clients: clients?.length })

    return {
      activities: activities || [],
      clients: clients || []
    }

  } catch (error) {
    console.error('Error in fetchDetailedUserActivities:', error)
    throw error
  }
}
