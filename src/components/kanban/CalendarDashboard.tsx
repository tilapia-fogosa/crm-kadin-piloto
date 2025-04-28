
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, addMonths, subMonths, endOfMonth } from "date-fns"
import { useState } from "react"
import { useUserUnit } from "./hooks/useUserUnit"
import { Skeleton } from "@/components/ui/skeleton"
import { ReschedulingDialog } from "./components/scheduling/ReschedulingDialog"
import { CalendarHeader } from "./components/calendar/CalendarHeader"
import { CalendarGrid } from "./components/calendar/CalendarGrid"

export function CalendarDashboard() {
  console.log('Renderizando CalendarDashboard')
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string>('')
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  // Função para navegar para o mês anterior
  const handlePreviousMonth = () => {
    console.log('Navegando para o mês anterior')
    setCurrentDate(prev => subMonths(prev, 1))
  }

  // Função para navegar para o próximo mês
  const handleNextMonth = () => {
    console.log('Navegando para o próximo mês')
    setCurrentDate(prev => addMonths(prev, 1))
  }

  // Função para lidar com o reagendamento
  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('Iniciando reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  const { data: scheduledAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['scheduled-appointments', format(currentDate, 'yyyy-MM'), userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      console.log('Buscando agendamentos para o mês:', format(currentDate, 'yyyy-MM'))
      
      // Usamos startOfMonth e endOfMonth da biblioteca date-fns para melhor precisão
      const startOfMonthDate = startOfMonth(currentDate)
      
      // ALTERAÇÃO: Usar endOfMonth em vez do método manual para garantir que inclua o último dia
      const endOfMonthDate = endOfMonth(currentDate)
      
      // Logs detalhados para debugging
      console.log('Período de busca:', {
        inicio: format(startOfMonthDate, 'yyyy-MM-dd'),
        fim: format(endOfMonthDate, 'yyyy-MM-dd')
      })
      
      // Convertemos para string sem considerar fuso horário (apenas data)
      const startDateStr = format(startOfMonthDate, 'yyyy-MM-dd')
      const endDateStr = format(endOfMonthDate, 'yyyy-MM-dd') + 'T23:59:59'
      
      console.log('Strings de data usadas na consulta:', {
        inicio: startDateStr,
        fim: endDateStr
      })
      
      const unitIds = userUnits?.map(u => u.unit_id) || []
      
      if (unitIds.length === 0) {
        console.log('Nenhuma unidade disponível para o usuário')
        return []
      }
      
      console.log('Filtrando por unidades:', unitIds)
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          scheduled_date,
          status
        `)
        .eq('active', true)
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startDateStr)
        .lte('scheduled_date', endDateStr)

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        throw error
      }

      console.log(`Total de agendamentos encontrados: ${data?.length || 0}`)
      
      // Verificar especificamente se há agendamentos para o dia 30
      const dia30 = data?.filter(item => {
        const dataAgendamento = new Date(item.scheduled_date)
        return dataAgendamento.getDate() === 30
      })
      
      console.log(`Agendamentos para o dia 30: ${dia30?.length || 0}`)
      if (dia30?.length) {
        console.log('Detalhes dos agendamentos do dia 30:', dia30)
      }
      
      const appointments = data?.map(client => ({
        id: client.id,
        client_name: client.name,
        scheduled_date: client.scheduled_date,
        status: client.status
      })) || []

      console.log('Agendamentos processados:', appointments)
      return appointments
    },
    refetchInterval: 5000,
    refetchOnMount: true,
    enabled: userUnits !== undefined && userUnits.length > 0
  })

  if (isLoadingUnits) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Agenda</span>
            <span className="text-xs">de Leads</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">Agenda</span>
          <span className="text-xs">de Leads</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        <CalendarGrid
          currentDate={currentDate}
          isLoadingAppointments={isLoadingAppointments}
          scheduledAppointments={scheduledAppointments}
          onReschedule={handleReschedule}
        />
      </DialogContent>

      {selectedClientId && (
        <ReschedulingDialog
          open={isReschedulingDialogOpen}
          onOpenChange={setIsReschedulingDialogOpen}
          clientId={selectedClientId}
          clientName={selectedClientName}
          onSubmit={(scheduling) => {
            console.log('Agendamento remarcado:', scheduling)
            setIsReschedulingDialogOpen(false)
          }}
        />
      )}
    </Dialog>
  )
}
