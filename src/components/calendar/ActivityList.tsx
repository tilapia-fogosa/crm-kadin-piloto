
import { useQuery } from "@tanstack/react-query"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ActivityListProps {
  date: Date
  filters: {
    source: ('system' | 'google')[]
    calendars: string[]
  }
}

interface Activity {
  id: string
  title: string
  start_time: string
  end_time: string
  description?: string
  source: 'system' | 'google'
  calendar?: {
    id: string
    summary: string
    backgroundColor: string
  }
}

export function ActivityList({ date, filters }: ActivityListProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', date, filters],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', new Date(date.setHours(0, 0, 0, 0)).toISOString())
        .lte('start_time', new Date(date.setHours(23, 59, 59, 999)).toISOString());

      if (error) throw error;

      // Por enquanto retornamos apenas os eventos do sistema
      // TODO: Implementar integração com eventos do Google Calendar
      return events.map(event => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        description: event.description,
        source: 'system' as const
      }));
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[50px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <CalendarIcon className="h-8 w-8 mb-2" />
        <p>Nenhuma atividade para este dia</p>
      </div>
    )
  }

  const filteredActivities = activities.filter(activity => {
    if (!filters.source.includes(activity.source)) return false;
    if (activity.source === 'google' && activity.calendar) {
      return filters.calendars.length === 0 || filters.calendars.includes(activity.calendar.id);
    }
    return true;
  })

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{activity.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {activity.description || "Sem descrição"}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(activity.start_time), "HH:mm")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
