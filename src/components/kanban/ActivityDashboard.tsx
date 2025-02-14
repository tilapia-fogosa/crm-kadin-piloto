
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, endOfMonth, getYear, setYear, setMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LineChart } from "lucide-react"
import { useState } from "react"

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
  leadSource?: string
}

const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" }
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i)

export function ActivityDashboard() {
  const [selectedSource, setSelectedSource] = useState<string>("todos")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const { data: leadSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)))
      const endDate = endOfMonth(startDate)

      const [clientsResult, activitiesResult] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase
          .from('client_activities')
          .select('*, clients!inner(*)')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ])

      if (clientsResult.error) throw clientsResult.error
      if (activitiesResult.error) throw activitiesResult.error

      const clients = clientsResult.data
      const activities = activitiesResult.data

      const dailyStats: DailyStats[] = Array.from(
        { length: endDate.getDate() },
        (_, index) => {
          const date = new Date(startDate)
          date.setDate(index + 1)
          const dayStart = new Date(date.setHours(0, 0, 0, 0))
          const dayEnd = new Date(date.setHours(23, 59, 59, 999))

          const newClients = clients.filter(client => 
            new Date(client.created_at) >= dayStart && 
            new Date(client.created_at) <= dayEnd
          ).length

          const dayActivities = activities.filter(activity => 
            new Date(activity.created_at) >= dayStart && 
            new Date(activity.created_at) <= dayEnd
          )

          const contactAttempts = dayActivities.filter(activity => 
            ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length

          const effectiveContacts = dayActivities.filter(activity => 
            ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length

          const scheduledVisits = dayActivities.filter(activity => 
            activity.tipo_atividade === 'Agendamento'
          ).length

          const awaitingVisits = activities.filter(activity => 
            activity.tipo_atividade === 'Agendamento' &&
            activity.scheduled_date &&
            new Date(activity.scheduled_date) >= dayStart &&
            new Date(activity.scheduled_date) <= dayEnd
          ).length

          const completedVisits = dayActivities.filter(activity => 
            activity.tipo_atividade === 'Atendimento'
          ).length

          const enrollments = clients.filter(client => 
            client.status === 'matricula' &&
            new Date(client.updated_at) >= dayStart &&
            new Date(client.updated_at) <= dayEnd
          ).length

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
        }
      )

      return dailyStats
    },
    refetchInterval: 5000
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LineChart className="h-4 w-4" />
          Painel de Atividades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <LineChart className="h-6 w-6" />
            Painel de Atividades
          </DialogTitle>
          <div className="flex flex-wrap gap-4 justify-start">
            <div className="flex items-center gap-2">
              <span className="font-medium">Origem:</span>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {leadSources?.map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Mês:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Ano:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-center p-0 bg-[#FEC6A1] text-xs font-semibold w-20">Data</TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Novos\nClientes"}
                </TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-16">
                  {"Tentativa\nde Contato"}
                </TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Contatos\nEfetivos"}
                </TableHead>
                <TableHead className="text-center p-0 bg-[#FEC6A1] text-xs font-semibold w-12">% CE</TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Visitas\nAgendadas"}
                </TableHead>
                <TableHead className="text-center p-0 bg-[#FEC6A1] text-xs font-semibold w-12">% AG</TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Visitas\nAguardadas"}
                </TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Visitas\nRealizadas"}
                </TableHead>
                <TableHead className="text-center p-0 bg-[#FEC6A1] text-xs font-semibold w-12">% AT</TableHead>
                <TableHead className="text-center p-0 whitespace-pre-line text-xs font-semibold w-14">
                  {"Matrí-\nculas"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-xs">Carregando...</TableCell>
                </TableRow>
              ) : (
                stats?.map((day) => (
                  <TableRow key={day.date.toISOString()} className="hover:bg-muted/50">
                    <TableCell className="text-center p-0 bg-[#FEC6A1] text-xs">
                      {format(day.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.newClients}</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.contactAttempts}</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.effectiveContacts}</TableCell>
                    <TableCell className="text-center p-0 bg-[#FEC6A1] text-xs">{day.ceConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.scheduledVisits}</TableCell>
                    <TableCell className="text-center p-0 bg-[#FEC6A1] text-xs">{day.agConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.awaitingVisits}</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.completedVisits}</TableCell>
                    <TableCell className="text-center p-0 bg-[#FEC6A1] text-xs">{day.atConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center p-0 text-xs">{day.enrollments}</TableCell>
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
