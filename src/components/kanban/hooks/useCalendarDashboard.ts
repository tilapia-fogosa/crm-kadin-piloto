
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

    console.log('Fetchando agendamentos da tabela clients')
    console.log('Unidades selecionadas:', selectedCalendarUnitIds)
    console.log('Unidades disponíveis:', userUnits.map(u => ({ id: u.unit_id, name: u.units.name })))
    
    setIsLoading(true)
    try {
      // Determinar quais IDs de unidades usar
      const unitIds = selectedCalendarUnitIds.length > 0 ? selectedCalendarUnitIds : userUnits.map(u => u.unit_id)
      console.log('IDs de unidades usados na query:', unitIds)
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      console.log('Período de busca:', {
        início: startOfMonth.toISOString(),
        fim: endOfMonth.toISOString()
      })

      // Query correta: buscar diretamente na tabela clients onde scheduled_date não é nulo
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          scheduled_date,
          unit_id,
          units (
            name
          )
        `)
        .not('scheduled_date', 'is', null)
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startOfMonth.toISOString())
        .lte('scheduled_date', endOfMonth.toISOString())
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return
      }

      console.log('Total de agendamentos encontrados:', clients?.length || 0)
      
      if (clients && clients.length > 0) {
        console.log('Primeiro agendamento encontrado:', clients[0])
      } else {
        console.log('Nenhum agendamento encontrado para o período e unidades selecionadas')
      }

      // Transform the data to match ScheduledAppointment interface
      const transformedAppointments: ScheduledAppointment[] = (clients || [])
        .filter(client => {
          // Verificar se temos os dados necessários do cliente
          if (!client.name || !client.scheduled_date) {
            console.log('Cliente ignorado por falta de dados:', client.id)
            return false
          }
          return true
        })
        .map(client => {
          const unit = client.units as any
          
          return {
            id: client.id,
            client_name: client.name,
            scheduled_date: client.scheduled_date,
            status: 'agendado',
            unit_id: client.unit_id || '',
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
    console.log('useEffect disparado - buscando agendamentos')
    console.log('Estado das dependências:', { 
      temUnidades: userUnits && userUnits.length > 0, 
      quantidadeUnidades: userUnits?.length || 0,
      unidadesSelecionadas: selectedCalendarUnitIds
    })
    
    fetchAppointments()
  }, [userUnits, currentDate, selectedCalendarUnitIds])

  // Initialize selected units when user units are loaded
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && selectedCalendarUnitIds.length === 0) {
      console.log('Inicializando unidades selecionadas:', userUnits.map(u => u.unit_id))
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
