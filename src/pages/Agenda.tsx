import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Activity {
  id: string
  leadId: string
  leadName: string
  type: "tentativa" | "contato" | "agendamento" | "atendimento"
  date: Date
  notes?: string
}

const mockActivities: Activity[] = [
  {
    id: "1",
    leadId: "1",
    leadName: "João Silva",
    type: "tentativa",
    date: new Date(2024, 1, 4, 14, 0),
  },
  {
    id: "2",
    leadId: "2",
    leadName: "Maria Santos",
    type: "agendamento",
    date: new Date(2024, 1, 4, 15, 30),
  },
]

export default function Agenda() {
  const today = new Date()
  const activities = mockActivities.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
      </div>

      <div className="grid grid-cols-[300px,1fr] gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={today}
              locale={ptBR}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Atividades do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{activity.leadName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === "tentativa" && "Tentativa de Contato"}
                          {activity.type === "contato" && "Contato Efetivo"}
                          {activity.type === "agendamento" && "Atendimento Agendado"}
                          {activity.type === "atendimento" && "Atendimento Realizado"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(activity.date, "HH:mm")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}