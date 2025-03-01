import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, getYear, setYear, setMonth, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart } from "lucide-react";
import { useState } from "react";
import { useUserUnit } from "./hooks/useUserUnit";

interface DailyStats {
  date: Date;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
  leadSource?: string;
}

const MONTHS = [{
  value: "0",
  label: "Janeiro"
}, {
  value: "1",
  label: "Fevereiro"
}, {
  value: "2",
  label: "Março"
}, {
  value: "3",
  label: "Abril"
}, {
  value: "4",
  label: "Maio"
}, {
  value: "5",
  label: "Junho"
}, {
  value: "6",
  label: "Julho"
}, {
  value: "7",
  label: "Agosto"
}, {
  value: "8",
  label: "Setembro"
}, {
  value: "9",
  label: "Outubro"
}, {
  value: "10",
  label: "Novembro"
}, {
  value: "11",
  label: "Dezembro"
}];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({
  length: 3
}, (_, i) => currentYear - 1 + i);

export function ActivityDashboard() {
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const { data: userUnits } = useUserUnit();

  const {
    data: leadSources
  } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);
      const unitIds = userUnits?.map(u => u.unit_id) || [];
      const today = startOfDay(new Date());

      console.log('Buscando estatísticas para o período:', { startDate, endDate });

      const [clientsResult, activitiesResult] = await Promise.all([
        supabase.from('clients')
          .select('*')
          .eq('active', true)
          .in('unit_id', unitIds)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase.from('client_activities')
          .select('*, clients!inner(*)')
          .eq('active', true)
          .eq('clients.active', true)
          .in('clients.unit_id', unitIds)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'clients.lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      const clients = clientsResult.data;
      const activities = activitiesResult.data;

      console.log('Total de clientes encontrados:', clients.length);
      console.log('Total de atividades encontradas:', activities.length);

      const validDates = Array.from({ length: endDate.getDate() }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(index + 1);
        return !isAfter(startOfDay(date), today) ? date : null;
      }).filter(date => date !== null) as Date[];

      const dailyStats = validDates.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayActivities = activities.filter(activity => 
          new Date(activity.created_at) >= dayStart && 
          new Date(activity.created_at) <= dayEnd
        );

        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        console.log(`Estatísticas para ${format(dayStart, 'dd/MM/yyyy')}:`, {
          totalAtividades: dayActivities.length,
          matriculas: enrollments
        });

        return {
          date,
          newClients: clients.filter(client => 
            new Date(client.created_at) >= dayStart && 
            new Date(client.created_at) <= dayEnd
          ).length,
          contactAttempts: dayActivities.filter(activity => 
            ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          effectiveContacts: dayActivities.filter(activity => 
            ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
          ).length,
          scheduledVisits: dayActivities.filter(activity => 
            activity.tipo_atividade === 'Agendamento'
          ).length,
          awaitingVisits: activities.filter(activity => 
            activity.tipo_atividade === 'Agendamento' && 
            activity.scheduled_date && 
            new Date(activity.scheduled_date) >= dayStart && 
            new Date(activity.scheduled_date) <= dayEnd
          ).length,
          completedVisits: dayActivities.filter(activity => 
            activity.tipo_atividade === 'Atendimento'
          ).length,
          enrollments,
          ceConversionRate: 0,
          agConversionRate: 0,
          atConversionRate: 0
        };
      });

      return dailyStats.map(day => ({
        ...day,
        ceConversionRate: day.contactAttempts > 0 ? (day.effectiveContacts / day.contactAttempts) * 100 : 0,
        agConversionRate: day.effectiveContacts > 0 ? (day.scheduledVisits / day.effectiveContacts) * 100 : 0,
        atConversionRate: day.awaitingVisits > 0 ? (day.completedVisits / day.awaitingVisits) * 100 : 0
      }));
    },
    enabled: userUnits !== undefined && userUnits.length > 0,
    refetchInterval: 5000
  });

  const calculateTotals = (stats: DailyStats[] | undefined) => {
    if (!stats) return null;
    
    return stats.reduce((acc, day) => ({
      newClients: acc.newClients + day.newClients,
      contactAttempts: acc.contactAttempts + day.contactAttempts,
      effectiveContacts: acc.effectiveContacts + day.effectiveContacts,
      scheduledVisits: acc.scheduledVisits + day.scheduledVisits,
      awaitingVisits: acc.awaitingVisits + day.awaitingVisits,
      completedVisits: acc.completedVisits + day.completedVisits,
      enrollments: acc.enrollments + day.enrollments,
      ceConversionRate: acc.contactAttempts > 0 ? (acc.effectiveContacts / acc.contactAttempts) * 100 : 0,
      agConversionRate: acc.effectiveContacts > 0 ? (acc.scheduledVisits / acc.effectiveContacts) * 100 : 0,
      atConversionRate: acc.awaitingVisits > 0 ? (acc.completedVisits / acc.awaitingVisits) * 100 : 0,
    }), {
      newClients: 0,
      contactAttempts: 0,
      effectiveContacts: 0,
      scheduledVisits: 0,
      awaitingVisits: 0,
      completedVisits: 0,
      enrollments: 0,
      ceConversionRate: 0,
      agConversionRate: 0,
      atConversionRate: 0,
    });
  };

  const totals = calculateTotals(stats);

  return <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
          <LineChart className="h-4 w-4" />
          <span className="text-xs">Painel de</span>
          <span className="text-xs">Atividades</span>
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
                  {leadSources?.map(source => <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>)}
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
                  {MONTHS.map(month => <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>)}
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
                  {YEARS.map(year => <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent [&>th]:px-2.5">
                <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[18px]">Data</TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Novos\nClientes"}
                </TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[14.4px]">
                  {"Total de\nContatos"}
                </TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Contatos\nEfetivos"}
                </TableHead>
                <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% CE</TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Visitas\nAgendadas"}
                </TableHead>
                <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AG</TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Visitas\nAguardadas"}
                </TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Visitas\nRealizadas"}
                </TableHead>
                <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AT</TableHead>
                <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
                  {"Matrí-\nculas"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow>
                  <TableCell colSpan={11} className="text-center text-xs py-3 px-2.5">Carregando...</TableCell>
                </TableRow> : (
                  <>
                    {stats?.map(day => <TableRow key={day.date.toISOString()} className="hover:bg-muted/50 [&>td]:px-2.5">
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                        {format(day.date, 'dd/MM/yyyy', {
                          locale: ptBR
                        })}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">{day.newClients}</TableCell>
                      <TableCell className="text-center text-xs py-0">{day.contactAttempts}</TableCell>
                      <TableCell className="text-center text-xs py-0">{day.effectiveContacts}</TableCell>
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.ceConversionRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-center text-xs py-0">{day.scheduledVisits}</TableCell>
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.agConversionRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-center text-xs py-0">{day.awaitingVisits}</TableCell>
                      <TableCell className="text-center text-xs py-0">{day.completedVisits}</TableCell>
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.atConversionRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-center text-xs py-[5px]">{day.enrollments}</TableCell>
                    </TableRow>)}
                    
                    {totals && (
                      <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-bold border-t-2">
                        <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">TOTAL</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.newClients}</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.contactAttempts}</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.effectiveContacts}</TableCell>
                        <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.ceConversionRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.scheduledVisits}</TableCell>
                        <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.agConversionRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.awaitingVisits}</TableCell>
                        <TableCell className="text-center text-xs py-0">{totals.completedVisits}</TableCell>
                        <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.atConversionRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-center text-xs py-[5px]">{totals.enrollments}</TableCell>
                      </TableRow>
                    )}
                  </>
                )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>;
}
