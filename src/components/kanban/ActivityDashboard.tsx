
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DailyStats {
  date: Date
  newClients: number
  contactAttempts: number
  effectiveContacts: number
  ceConversionRate: number
  scheduledVisits: number
  agConversionRate: number
  awaitingVisits: number
  completedVisits: number
  atConversionRate: number
  enrollments: number
}

export function ActivityDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['activity-dashboard'],
    queryFn: async () => {
      const endDate = new Date()
      const startDate = subDays(endDate, 30) // Últimos 30 dias

      // Buscar todos os clientes e atividades do período
      const [clientsResult, activitiesResult] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('client_activities')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ])

      if (clientsResult.error) throw clientsResult.error
      if (activitiesResult.error) throw activitiesResult.error

      const clients = clientsResult.data
      const activities = activitiesResult.data

      // Criar array com todos os dias do período
      const days = eachDayOfInterval({ start: startDate, end: endDate })

      // Calcular estatísticas para cada dia
      const dailyStats: DailyStats[] = days.map(date => {
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        // Novos clientes no dia
        const newClients = clients.filter(client => 
          new Date(client.created_at) >= dayStart && 
          new Date(client.created_at) <= dayEnd
        ).length

        // Atividades do dia
        const dayActivities = activities.filter(activity => 
          new Date(activity.created_at) >= dayStart && 
          new Date(activity.created_at) <= dayEnd
        )

        // Tentativas de contato (inclui todas as tentativas até agendamento)
        const contactAttempts = dayActivities.filter(activity => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length

        // Contatos efetivos (contatos efetivos + agendamentos)
        const effectiveContacts = dayActivities.filter(activity => 
          ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length

        // Agendamentos feitos no dia
        const scheduledVisits = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Agendamento'
        ).length

        // Visitas aguardadas (agendamentos para esta data)
        const awaitingVisits = activities.filter(activity => 
          activity.tipo_atividade === 'Agendamento' &&
          activity.scheduled_date &&
          new Date(activity.scheduled_date) >= dayStart &&
          new Date(activity.scheduled_date) <= dayEnd
        ).length

        // Visitas realizadas
        const completedVisits = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Atendimento'
        ).length

        // Matrículas
        const enrollments = clients.filter(client => 
          client.status === 'matricula' &&
          new Date(client.updated_at) >= dayStart &&
          new Date(client.updated_at) <= dayEnd
        ).length

        // Cálculo das taxas de conversão
        const ceConversionRate = contactAttempts > 0 ? (effectiveContacts / contactAttempts) * 100 : 0
        const agConversionRate = effectiveContacts > 0 ? (scheduledVisits / effectiveContacts) * 100 : 0
        const atConversionRate = awaitingVisits > 0 ? (completedVisits / awaitingVisits) * 100 : 0

        return {
          date,
          newClients,
          contactAttempts,
          effectiveContacts,
          ceConversionRate,
          scheduledVisits,
          agConversionRate,
          awaitingVisits,
          completedVisits,
          atConversionRate,
          enrollments
        }
      })

      return dailyStats.reverse() // Ordem decrescente de data
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Painel de Atividades</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Painel de Atividades</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Data</TableHead>
                <TableHead className="text-center">Novos Clientes</TableHead>
                <TableHead className="text-center">Tentativas de Contato</TableHead>
                <TableHead className="text-center">Contatos Efetivos</TableHead>
                <TableHead className="text-center">% CE</TableHead>
                <TableHead className="text-center">Visitas Agendadas</TableHead>
                <TableHead className="text-center">% AG</TableHead>
                <TableHead className="text-center">Visitas Aguardadas</TableHead>
                <TableHead className="text-center">Visitas Realizadas</TableHead>
                <TableHead className="text-center">% AT</TableHead>
                <TableHead className="text-center">Matrículas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : (
                stats?.map((day) => (
                  <TableRow key={day.date.toISOString()}>
                    <TableCell className="text-center">
                      {format(day.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-center">{day.newClients}</TableCell>
                    <TableCell className="text-center">{day.contactAttempts}</TableCell>
                    <TableCell className="text-center">{day.effectiveContacts}</TableCell>
                    <TableCell className="text-center">{day.ceConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center">{day.scheduledVisits}</TableCell>
                    <TableCell className="text-center">{day.agConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center">{day.awaitingVisits}</TableCell>
                    <TableCell className="text-center">{day.completedVisits}</TableCell>
                    <TableCell className="text-center">{day.atConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center">{day.enrollments}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
