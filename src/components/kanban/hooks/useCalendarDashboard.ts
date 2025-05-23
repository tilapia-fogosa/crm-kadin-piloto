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

    console.log('=== INÍCIO DEBUG CALENDÁRIO ===')
    console.log('Fetchando agendamentos da tabela clients')
    console.log('userUnits recebido:', userUnits)
    console.log('Tipo do userUnits:', typeof userUnits, Array.isArray(userUnits))
    
    // Debug detalhado da estrutura do userUnits
    if (userUnits.length > 0) {
      console.log('Primeiro item do userUnits:', userUnits[0])
      console.log('Chaves do primeiro item:', Object.keys(userUnits[0]))
    }
    
    // Tentar diferentes formas de extrair unit_ids
    console.log('selectedCalendarUnitIds:', selectedCalendarUnitIds)
    
    setIsLoading(true)
    try {
      // Extrair unit_ids corretamente baseado na estrutura real
      let unitIds: string[] = []
      
      if (selectedCalendarUnitIds.length > 0 && !selectedCalendarUnitIds.includes('todos')) {
        unitIds = selectedCalendarUnitIds
        console.log('Usando unidades selecionadas manualmente:', unitIds)
      } else {
        // Tentar extrair unit_ids do userUnits
        unitIds = userUnits.map(u => {
          console.log('Processando item userUnit:', u)
          // Tentar diferentes possibilidades de estrutura
          return u.unit_id || u.units?.id || u.id
        }).filter(Boolean)
        
        console.log('unit_ids extraídos do userUnits:', unitIds)
      }
      
      // Se ainda não temos unitIds, usar uma abordagem de fallback
      if (unitIds.length === 0) {
        console.log('FALLBACK: Nenhum unit_id encontrado, tentando buscar todos os agendamentos sem filtro de unidade')
        
        // Buscar agendamentos sem filtro de unidade para debug
        const { data: allClients, error: debugError } = await supabase
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
          .gte('scheduled_date', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
          .lte('scheduled_date', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString())
          .order('scheduled_date', { ascending: true })
        
        if (!debugError && allClients) {
          console.log('FALLBACK: Total de agendamentos encontrados SEM filtro de unidade:', allClients.length)
          console.log('FALLBACK: Primeiros 3 agendamentos:', allClients.slice(0, 3))
          
          // Se encontrou agendamentos, significa que o problema é no filtro de unidades
          const uniqueUnitIds = [...new Set(allClients.map(c => c.unit_id).filter(Boolean))]
          console.log('FALLBACK: Unit IDs únicos encontrados nos agendamentos:', uniqueUnitIds)
        }
        
        // Para este fallback, vamos retornar sem filtrar por unidade
        if (allClients) {
          const transformedAppointments: ScheduledAppointment[] = allClients
            .filter(client => client.name && client.scheduled_date)
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

          console.log('FALLBACK: Agendamentos transformados:', transformedAppointments.length)
          setAppointments(transformedAppointments)
          setIsLoading(false)
          return
        }
      }
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      console.log('Período de busca:', {
        início: startOfMonth.toISOString(),
        fim: endOfMonth.toISOString()
      })
      console.log('IDs de unidades usados na query:', unitIds)

      // Query com filtro de unidades
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

      console.log('Total de agendamentos encontrados COM filtro:', clients?.length || 0)
      
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

      console.log('Agendamentos transformados:', transformedAppointments.length)
      console.log('=== FIM DEBUG CALENDÁRIO ===')
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
      console.log('Inicializando unidades selecionadas')
      console.log('userUnits para inicialização:', userUnits)
      
      // Tentar extrair unit_ids para inicialização
      const unitIds = userUnits.map(u => u.unit_id || u.units?.id || u.id).filter(Boolean)
      console.log('unit_ids para inicialização:', unitIds)
      
      if (unitIds.length > 0) {
        setSelectedCalendarUnitIds(unitIds)
      } else {
        console.log('Não foi possível extrair unit_ids, usando "todos"')
        setSelectedCalendarUnitIds(['todos'])
      }
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
