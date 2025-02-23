
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
    name: string
    backgroundColor: string
  }
}

export function ActivityList({ date, filters }: ActivityListProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', date, filters],
    queryFn: async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (error) throw error;

      return events.map(event => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        description: event.description,
        source: event.google_event_id ? 'google' : 'system',
        calendar: event.calendar_id ? {
          id: event.calendar_id,
          name: event.calendar_name || 'Calendário Google',
          backgroundColor: event.calendar_background_color || '#4285f4'
        } : undefined
      }));
    }
  });

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
    );
  }

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <CalendarIcon className="h-8 w-8 mb-2" />
        <p>Nenhuma atividade para este dia</p>
      </div>
    );
  }

  const filteredActivities = activities.filter(activity => {
    // Primeiro verifica se a origem está nos filtros ativos
    if (!filters.source.includes(activity.source)) {
      return false;
    }
    
    // Se for um evento do Google Calendar, verifica os filtros de calendário
    if (activity.source === 'google' && activity.calendar) {
      if (filters.calendars.length === 0) {
        return true; // Se não há calendários selecionados, mostra todos
      }
      return filters.calendars.includes(activity.calendar.id);
    }
    
    // Para eventos do sistema, sempre retorna true se passou pelo filtro de origem
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activity.calendar && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: activity.calendar.backgroundColor }}
                    />
                  )}
                  <h4 className="font-semibold">{activity.title}</h4>
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                )}
                {activity.calendar && (
                  <p className="text-xs text-muted-foreground">
                    {activity.calendar.name}
                  </p>
                )}
              </div>
              <div className="text-sm text-muted-foreground space-y-1 text-right">
                <div>{format(new Date(activity.start_time), "HH:mm")}</div>
                <div className="text-xs">
                  até {format(new Date(activity.end_time), "HH:mm")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
