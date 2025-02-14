
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ScheduledLead {
  id: string
  name: string
  scheduled_date: string
}

export function CalendarDashboard() {
  const { data: scheduledLeads } = useQuery({
    queryKey: ['scheduled-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, scheduled_date')
        .not('scheduled_date', 'is', null)
        .order('scheduled_date')

      if (error) throw error
      return data as ScheduledLead[]
    }
  })

  const currentDate = new Date()
  const currentMonth = format(currentDate, 'MMM', { locale: ptBR }).toUpperCase()
  const currentYear = currentDate.getFullYear()
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = startOfMonth(currentDate)
  const startingDayIndex = getDay(firstDayOfMonth) // 0 = Domingo, 1 = Segunda, etc.

  const getDayLeads = (dayNumber: number) => {
    if (dayNumber <= 0 || dayNumber > daysInMonth) return []
    
    return scheduledLeads?.filter(lead => {
      const leadDate = new Date(lead.scheduled_date)
      return leadDate.getDate() === dayNumber &&
             leadDate.getMonth() === currentDate.getMonth() &&
             leadDate.getFullYear() === currentDate.getFullYear()
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  // Criar array com dias vazios no início + dias do mês
  const calendarDays = [
    ...Array(startingDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

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
            <div className="bg-emerald-600 text-white px-6 py-2 rounded-full text-lg font-semibold">
              {currentMonth} {currentYear}
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

          {/* Calendar grid */}
          {calendarDays.map((day, index) => {
            const leads = day ? getDayLeads(day) : []
            const isCurrentDay = day === currentDate.getDate()

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
                          className="text-xs p-1 bg-gray-100 rounded"
                        >
                          {format(new Date(lead.scheduled_date), 'HH:mm')} - {lead.name}
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
