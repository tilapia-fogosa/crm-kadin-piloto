
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

interface ScheduledLead {
  id: string
  name: string
  scheduled_date: string
  status: string
}

export function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: userUnits } = useUserUnit()

  const { data: scheduledLeads } = useQuery({
    queryKey: ['scheduled-leads', format(currentDate, 'yyyy-MM'), userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      const startOfMonthDate = startOfMonth(currentDate)
      const endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const unitIds = userUnits?.map(u => u.unit_id) || []
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, scheduled_date, status')
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startOfMonthDate.toISOString())
        .lte('scheduled_date', endOfMonthDate.toISOString())
        .order('scheduled_date')

      if (error) throw error
      return data as ScheduledLead[]
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

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1))
  }

  const getDayLeads = (dayNumber: number) => {
    if (dayNumber <= 0 || dayNumber > daysInMonth) return []
    
    return scheduledLeads?.filter(lead => {
      const leadDate = new Date(lead.scheduled_date)
      return leadDate.getDate() === dayNumber &&
             leadDate.getMonth() === currentDate.getMonth() &&
             leadDate.getFullYear() === currentDate.getFullYear()
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const calendarDays = [
    ...Array(startingDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const LeadActions = ({ lead }: { lead: ScheduledLead }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Remarcar</DropdownMenuItem>
        <DropdownMenuItem>Confirmar Presença</DropdownMenuItem>
        <DropdownMenuItem>Cancelar Agendamento</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

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

          {calendarDays.map((day, index) => {
            const leads = day ? getDayLeads(day) : []
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
                {day && (
                  <>
                    <div className={`text-right mb-1 ${
                      isCurrentDay ? 'text-emerald-600 font-bold' : ''
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {leads?.map(lead => (
                        <div 
                          key={lead.id}
                          className="text-xs p-1 bg-gray-100 rounded flex items-center justify-between group"
                        >
                          <span>
                            {format(new Date(lead.scheduled_date), 'HH:mm')} - {lead.name}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <LeadActions lead={lead} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
