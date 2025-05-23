
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

export function useCalendarDashboard(selectedUnitIds: string[]) {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  const fetchAppointments = async () => {
    console.log('🔍 === INÍCIO DEBUG AGENDA DE LEADS (OPÇÃO 1 SIMPLIFICADA) ===')
    console.log('📋 selectedUnitIds recebidos do Kanban:', selectedUnitIds)
    console.log('🔢 Quantidade de unidades vindas do Kanban:', selectedUnitIds?.length || 0)
    console.log('📊 UserUnits do hook:', userUnits?.length || 0)
    console.log('📅 Data atual para busca:', currentDate)
    
    if (!selectedUnitIds || selectedUnitIds.length === 0) {
      console.log('❌ Não há selectedUnitIds válidos do Kanban - executando fallback')
      console.log('🔄 Fallback: buscar TODOS os agendamentos do mês')
      
      setIsLoading(true)
      try {
        // Query simplificada para fallback - buscar TODOS os agendamentos do mês
        const startOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`
        const endOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`

        console.log('📅 [FALLBACK] Período simplificado:', {
          início: startOfMonth,
          fim: endOfMonth,
          mês: currentDate.getMonth() + 1,
          ano: currentDate.getFullYear()
        })

        const { data: allClients, error: fallbackError } = await supabase
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
          .gte('scheduled_date', startOfMonth)
          .lte('scheduled_date', endOfMonth + ' 23:59:59')
          .order('scheduled_date', { ascending: true })

        if (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError)
          setAppointments([])
        } else {
          console.log('📊 [FALLBACK] Total de agendamentos encontrados:', allClients?.length || 0)
          
          if (allClients && allClients.length > 0) {
            console.log('📋 [FALLBACK] Primeiros 3 agendamentos:', allClients.slice(0, 3))
            
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

            console.log('✅ [FALLBACK] Agendamentos processados:', transformedAppointments.length)
            console.log('📅 [FALLBACK] Agendamentos por dia:', transformedAppointments.reduce((acc, app) => {
              const day = new Date(app.scheduled_date).getDate()
              acc[day] = (acc[day] || 0) + 1
              return acc
            }, {} as Record<number, number>))
            
            setAppointments(transformedAppointments)
          } else {
            setAppointments([])
          }
        }
      } catch (error) {
        console.error('💥 Erro no fallback:', error)
        setAppointments([])
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    try {
      // Usar diretamente os selectedUnitIds vindos do Kanban
      let unitIds: string[] = selectedUnitIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
      
      console.log('🎯 Unit IDs para filtro (vindos do Kanban):', unitIds)
      
      if (unitIds.length === 0) {
        console.log('⚠️ ERRO: Nenhum unit_id válido nos selectedUnitIds')
        setAppointments([])
        setIsLoading(false)
        return
      }
      
      // Query simplificada - usando apenas strings de data
      const startOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`
      const endOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`

      console.log('📅 Período simplificado:', {
        início: startOfMonth,
        fim: endOfMonth,
        mês: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      })

      // Query otimizada e simplificada
      console.log('🔍 Executando query simplificada para Agenda de Leads...')
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
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth + ' 23:59:59')
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('❌ Erro na query principal:', error)
        setAppointments([])
        return
      }

      console.log('📊 Agendamentos encontrados na query principal:', clients?.length || 0)
      
      if (clients && clients.length > 0) {
        console.log('📋 Primeiro agendamento encontrado:', clients[0])
        console.log('📋 Distribuição por unidade:', 
          clients.reduce((acc, client) => {
            const unitName = (client.units as any)?.name || 'Sem unidade'
            acc[unitName] = (acc[unitName] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        )
        
        console.log('📅 Distribuição por dia do mês:', 
          clients.reduce((acc, client) => {
            const day = new Date(client.scheduled_date).getDate()
            acc[day] = (acc[day] || 0) + 1
            return acc
          }, {} as Record<number, number>)
        )
        
        const transformedAppointments: ScheduledAppointment[] = clients
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

        console.log('✅ Agendamentos processados com sucesso:', transformedAppointments.length)
        console.log('📅 Exemplo de agendamento processado:', transformedAppointments[0])
        setAppointments(transformedAppointments)
      } else {
        console.log('📭 Nenhum agendamento encontrado para as unidades e período especificados')
        
        // Debug adicional para verificar se existem agendamentos sem filtro
        const { data: debugClients } = await supabase
          .from('clients')
          .select('id, name, scheduled_date, unit_id, units(name)')
          .not('scheduled_date', 'is', null)
          .eq('active', true)
          .gte('scheduled_date', startOfMonth)
          .lte('scheduled_date', endOfMonth + ' 23:59:59')

        console.log('🔍 Debug - Total de agendamentos no período (sem filtro de unidade):', debugClients?.length || 0)
        if (debugClients && debugClients.length > 0) {
          const debugUnitIds = [...new Set(debugClients.map(c => c.unit_id))]
          console.log('🔍 Debug - unit_ids encontrados nos agendamentos:', debugUnitIds)
          console.log('🔍 Debug - unit_ids que estamos filtrando (Kanban):', unitIds)
          console.log('🔍 Debug - Intersecção:', debugUnitIds.filter(id => unitIds.includes(id)))
        }
        
        setAppointments([])
      }

      console.log('🏁 === FIM DEBUG AGENDA DE LEADS (OPÇÃO 1 SIMPLIFICADA) ===')
    } catch (error) {
      console.error('💥 Erro geral em fetchAppointments:', error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    console.log('⬅️ Navegando para o mês anterior')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    console.log('➡️ Navegando para o próximo mês')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('📅 Abrindo dialog de reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  useEffect(() => {
    console.log('🔄 useEffect disparado - buscando agendamentos')
    console.log('📊 Estado das dependências:', { 
      selectedUnitIds, 
      quantidadeUnidades: selectedUnitIds?.length || 0,
      mesAtual: currentDate.getMonth() + 1,
      anoAtual: currentDate.getFullYear()
    })
    
    fetchAppointments()
  }, [selectedUnitIds, currentDate])

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
    handlePreviousMonth,
    handleNextMonth,
    handleReschedule,
    scheduledAppointments: appointments,
    isLoadingAppointments: isLoading,
    refetch: fetchAppointments
  }
}
