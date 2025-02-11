
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import { getActivityBadge, getContactType } from "./utils/activityUtils"

interface ActivityHistoryProps {
  activities?: string[]
  onDeleteActivity: (id: string, clientId: string) => void
  clientId: string
}

export function ActivityHistory({ activities, onDeleteActivity, clientId }: ActivityHistoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        {activities?.map((activity, index) => {
          try {
            const parts = activity.split('|')
            if (parts.length < 5) {
              console.error('Invalid activity format:', activity);
              return null;
            }
            const tipo_atividade = parts[0]
            const tipo_contato = parts[1]
            const date = new Date(parts[2])
            const notes = parts[3]
            const id = parts[4]
            
            if (!id) {
              console.error('Activity without ID:', activity);
              return null;
            }
            
            return (
              <div key={index} className="mb-4 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                      {getActivityBadge(tipo_atividade)}
                    </span>
                    <span className="text-muted-foreground">
                      {getContactType(tipo_contato)}
                    </span>
                    <span className="text-muted-foreground">
                      {format(date, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteActivity(id, clientId);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {notes && (
                  <p className="text-sm text-muted-foreground ml-10">
                    {notes}
                  </p>
                )}
              </div>
            )
          } catch (error) {
            console.error('Error parsing activity:', error, activity)
            return null
          }
        })}
        {(!activities || activities.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
