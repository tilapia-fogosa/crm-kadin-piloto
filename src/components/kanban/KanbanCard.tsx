
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageSquare, Clock } from "lucide-react"
import { KanbanCard as KanbanCardType } from "./types"
import { differenceInMinutes, format } from "date-fns"

interface KanbanCardProps {
  card: KanbanCardType
  onClick: () => void
  onWhatsAppClick: (e: React.MouseEvent) => void
}

const formatElapsedTime = (registrationDate: string) => {
  console.log('Registration date:', registrationDate); // Debug log
  const now = new Date()
  const regDate = new Date(registrationDate)
  console.log('Parsed date:', regDate); // Debug log
  const minutes = differenceInMinutes(now, regDate)
  console.log('Calculated minutes:', minutes); // Debug log
  return minutes
}

const formatLastActivity = (activity: string) => {
  const parts = activity.split('|')
  const date = new Date(parts[2])
  return {
    type: `${parts[0]} - ${parts[1]}`,
    date: format(date, 'dd-MM-yy HH:mm')
  }
}

export function KanbanCard({ card, onClick, onWhatsAppClick }: KanbanCardProps) {
  const lastActivity = card.activities && card.activities.length > 0 
    ? formatLastActivity(card.activities[card.activities.length - 1])
    : null

  const elapsedMinutes = formatElapsedTime(card.registrationDate)

  return (
    <Card className="cursor-pointer hover:bg-accent/5" onClick={onClick}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{card.clientName}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{elapsedMinutes} Min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Origem: {card.leadSource}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={onWhatsAppClick}
            >
              <MessageSquare className="h-4 w-4 text-green-500" />
            </Button>
            <Phone className="h-4 w-4" />
            <span className="text-sm">{card.phoneNumber}</span>
          </div>
          {lastActivity && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">
                Última Atividade:
              </p>
              <p className="text-sm">{lastActivity.type}</p>
              <p className="text-sm text-muted-foreground">{lastActivity.date}</p>
            </div>
          )}
          {card.labels && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
