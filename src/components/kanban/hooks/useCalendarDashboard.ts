
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useUserUnit } from "./useUserUnit"

interface ScheduledAppointment {
  id: string
  client_name: string
  scheduled_date: string
  status: string
  unit_id: string
  unit_name?: string
}

export function useCalendarDashboard() {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: userUnits } = useUserUnit()

  const fetchAppointments = async () => {
    if (!userUnits || userUnits.length === 0) return

    setIsLoading(true)
    try {
      console.log('Fetching scheduled appointments for dashboard')
      
      const unitIds = userUnits.map(u => u.unit_id)
      const today = new Date()
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias

      // Query client_activities for scheduled appointments with client names
      const { data: activities, error } = await supabase
        .from('client_activities')
        .select(`
          id,
          scheduled_date,
          client_id,
          clients!inner (
            name,
            unit_id,
            units (
              name
            )
          )
        `)
        .eq('tipo_atividade', 'Agendamento')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('scheduled_date', today.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        return
      }

      console.log('Fetched activities:', activities)

      // Transform the data to match ScheduledAppointment interface
      const transformedAppointments: ScheduledAppointment[] = (activities || []).map(activity => {
        const client = activity.clients as any
        const unit = client?.units as any
        
        return {
          id: activity.id,
          client_name: client?.name || 'Nome não disponível',
          scheduled_date: activity.scheduled_date,
          status: 'agendado',
          unit_id: client?.unit_id || '',
          unit_name: unit?.name || 'Unidade não disponível'
        }
      })

      console.log('Transformed appointments:', transformedAppointments)
      setAppointments(transformedAppointments)
    } catch (error) {
      console.error('Error in fetchAppointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAppointments()
    }
  }, [isOpen, userUnits])

  return {
    appointments,
    isOpen,
    setIsOpen,
    isLoading,
    refetch: fetchAppointments
  }
}
