
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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  const [selectedCalendarUnitIds, setSelectedCalendarUnitIds] = useState<string[]>([])
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  const fetchAppointments = async () => {
    if (!userUnits || userUnits.length === 0) return

    console.log('Fetchando agendamentos para o calendário dashboard')
    setIsLoading(true)
    try {
      const unitIds = selectedCalendarUnitIds.length > 0 ? selectedCalendarUnitIds : userUnits.map(u => u.unit_id)
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

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
        .gte('scheduled_date', startOfMonth.toISOString())
        .lte('scheduled_date', endOfMonth.toISOString())
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return
      }

      console.log('Atividades buscadas:', activities)

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

      console.log('Agendamentos transformados:', transformedAppointments)
      setAppointments(transformedAppointments)
    } catch (error) {
      console.error('Erro em fetchAppointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    console.log('Navegando para o mês anterior')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    console.log('Navegando para o próximo mês')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('Abrindo dialog de reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  useEffect(() => {
    // Removida a verificação de isOpen aqui - agora busca dados sempre que as dependências mudarem
    fetchAppointments()
  }, [userUnits, currentDate, selectedCalendarUnitIds])

  // Initialize selected units when user units are loaded
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && selectedCalendarUnitIds.length === 0) {
      setSelectedCalendarUnitIds(userUnits.map(u => u.unit_id))
    }
  }, [userUnits, selectedCalendarUnitIds.length])

  return {
    appointments,
    isOpen,
    setIsOpen,
    isLoading,
    currentDate,
    isReschedulingDialogOpen,
    setIsReschedulingDialogOpen,
    selectedClientId,
    selectedClientName,
    userUnits,
    isLoadingUnits,
    selectedCalendarUnitIds,
    setSelectedCalendarUnitIds,
    handlePreviousMonth,
    handleNextMonth,
    handleReschedule,
    scheduledAppointments: appointments,
    isLoadingAppointments: isLoading,
    refetch: fetchAppointments
  }
}
