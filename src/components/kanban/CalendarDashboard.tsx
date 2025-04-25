
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { useUserUnit } from "./hooks/useUserUnit"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ReschedulingDialog } from "./components/scheduling/ReschedulingDialog"

interface ScheduledAppointment {
  id: string
  client_name: string
  scheduled_date: string
  status: string
}

export function CalendarDashboard() {
  console.log('Renderizando CalendarDashboard')
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string>('')
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  const { data: scheduledAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['scheduled-appointments', format(currentDate, 'yyyy-MM'), userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      console.log('Buscando agendamentos para o mês:', format(currentDate, 'yyyy-MM'))
      
      const startOfMonthDate = startOfMonth(currentDate)
      const endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const unitIds = userUnits?.map(u => u.unit_id) || []
      
      console.log('Período de busca:', {
        inicio: startOfMonthDate.toISOString(),
        fim: endOfMonthDate.toISOString()
      })
      
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
        .gte('scheduled_date', startOfMonthDate.toISOString())
        .lte('scheduled_date', endOfMonthDate.toISOString())

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        throw error
      }

      console.log(`Total de agendamentos encontrados: ${data?.length || 0}`)
      
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

  const currentMonth = format(currentDate, 'MMM', { locale: ptBR }).toUpperCase()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = startOfMonth(currentDate)
  const startingDayIndex = getDay(firstDayOfMonth)

  const generateCalendarDays = () => {
    console.log('Gerando dias do calendário para', format(currentDate, 'MMMM yyyy'))
    console.log('Primeiro dia do mês cai em:', startingDayIndex)
    console.log('Total de dias no mês:', daysInMonth)
    
    const days = []
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const days = generateCalendarDays()

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1))
  }

  const getDayAppointments = (dayNumber: number) => {
    if (dayNumber <= 0 || dayNumber > daysInMonth) return []
    
    return scheduledAppointments?.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_date)
      return appointmentDate.getDate() === dayNumber &&
             appointmentDate.getMonth() === currentDate.getMonth() &&
             appointmentDate.getFullYear() === currentDate.getFullYear()
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const handleReschedule = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  const AppointmentActions = ({ appointment }: { appointment: ScheduledAppointment }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleReschedule(appointment.id, appointment.client_name)}>
          Remarcar
        </DropdownMenuItem>
        <DropdownMenuItem>Confirmar Presença</DropdownMenuItem>
        <DropdownMenuItem>Cancelar Agendamento</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

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
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Calendar className="h-6 w-6" />
              Agenda de Leads
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handlePreviousMonth}
                className="hover:bg-emerald-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="bg-emerald-600 text-white px-6 py-2 rounded-full text-lg font-semibold min-w-[200px]">
                {currentMonth} {currentYear}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleNextMonth}
                className="hover:bg-emerald-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-7 gap-0.5 mt-4 text-sm">
          <div className="text-center font-semibold p-2">DOM</div>
          <div className="text-center font-semibold p-2">SEG</div>
          <div className="text-center font-semibold p-2">TER</div>
          <div className="text-center font-semibold p-2">QUA</div>
          <div className="text-center font-semibold p-2">QUI</div>
          <div className="text-center font-semibold p-2">SEX</div>
          <div className="text-center font-semibold p-2">SÁB</div>

          {days.map((day, index) => {
            const appointments = day ? getDayAppointments(day) : []
            const isCurrentDay = day === new Date().getDate() && 
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear()

            return (
              <div 
                key={index}
                className={`border min-h-[100px] p-2 ${
                  !day ? 'bg-gray-50' : 
                  isCurrentDay ? 'bg-emerald-50' : 'bg-white'
                }`}
              >
                {isLoadingAppointments ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  day && (
                    <>
                      <div className={`text-right mb-1 ${
                        isCurrentDay ? 'text-emerald-600 font-bold' : ''
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {appointments?.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="text-xs p-1 bg-gray-100 rounded flex items-center justify-between group"
                          >
                            <span>
                              {format(new Date(appointment.scheduled_date), 'HH:mm')} - {appointment.client_name}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <AppointmentActions appointment={appointment} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>

      {selectedClientId && (
        <ReschedulingDialog
          open={isReschedulingDialogOpen}
          onOpenChange={setIsReschedulingDialogOpen}
          clientId={selectedClientId}
          clientName={selectedClientName}
          onSubmit={(scheduling) => {
            console.log('Agendamento remarcado:', scheduling);
            setIsReschedulingDialogOpen(false);
          }}
        />
      )}
    </Dialog>
  )
}
