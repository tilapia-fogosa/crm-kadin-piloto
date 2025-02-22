
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { GoogleCalendarConnect } from "@/components/calendar/GoogleCalendarConnect"
import { CalendarFilters } from "@/components/calendar/CalendarFilters"
import { ActivityList } from "@/components/calendar/ActivityList"
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCheck, Loader2 } from "lucide-react"

interface Activity {
  id: string
  title: string
  start: Date
  end: Date
  source: 'system' | 'google'
  calendar?: {
    id: string
    summary: string
    backgroundColor: string
  }
}

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeFilters, setActiveFilters] = useState<{
    source: ('system' | 'google')[]
    calendars: string[]
  }>({
    source: ['system', 'google'],
    calendars: []
  })

  const {
    settings,
    calendars,
    isLoading,
    syncCalendars
  } = useGoogleCalendar()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          {settings?.last_sync && (
            <Badge variant="secondary" className="gap-1">
              <CalendarCheck className="h-3 w-3" />
              Última sinc: {format(new Date(settings.last_sync), "HH:mm")}
            </Badge>
          )}
        </div>
        <GoogleCalendarConnect />
      </div>

      <div className="grid grid-cols-[300px,1fr] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="w-full"
              />
            </CardContent>
          </Card>

          {settings?.google_account_email && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarFilters
                  calendars={calendars || []}
                  activeFilters={activeFilters}
                  onFilterChange={setActiveFilters}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>
              Atividades do Dia
            </CardTitle>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <ActivityList
                date={selectedDate}
                filters={activeFilters}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
