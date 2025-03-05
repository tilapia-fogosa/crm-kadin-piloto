
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, getYear, setYear, setMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

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
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

interface CommercialStats {
  id: string;
  name: string;
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
}

export default function CommercialPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Fetch stats by unit
  const { data: unitStats, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['commercial-stats-units', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);

      console.log('Buscando estatísticas por unidade:', { startDate, endDate });

      const { data, error } = await supabase
        .from('commercial_unit_stats')
        .select('*')
        .gte('month_year', startDate.toISOString())
        .lte('month_year', endDate.toISOString());

      if (error) throw error;
      
      return data.map(stat => ({
        id: stat.unit_id,
        name: stat.unit_name,
        newClients: stat.new_clients,
        contactAttempts: stat.contact_attempts,
        effectiveContacts: stat.effective_contacts,
        ceConversionRate: stat.ce_conversion_rate,
        scheduledVisits: stat.scheduled_visits,
        agConversionRate: stat.ag_conversion_rate,
        awaitingVisits: stat.awaiting_visits,
        completedVisits: stat.completed_visits,
        atConversionRate: stat.at_conversion_rate,
        enrollments: stat.enrollments
      }));
    }
  });

  // Fetch stats by user
  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['commercial-stats-users', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);

      console.log('Buscando estatísticas por usuário:', { startDate, endDate });

      const { data, error } = await supabase
        .from('commercial_user_stats')
        .select('*')
        .gte('month_year', startDate.toISOString())
        .lte('month_year', endDate.toISOString());

      if (error) throw error;
      
      return data.map(stat => ({
        id: stat.user_id,
        name: stat.user_name,
        newClients: stat.new_clients,
        contactAttempts: stat.contact_attempts,
        effectiveContacts: stat.effective_contacts,
        ceConversionRate: stat.ce_conversion_rate,
        scheduledVisits: stat.scheduled_visits,
        agConversionRate: stat.ag_conversion_rate,
        awaitingVisits: stat.awaiting_visits,
        completedVisits: stat.completed_visits,
        atConversionRate: stat.at_conversion_rate,
        enrollments: stat.enrollments
      }));
    }
  });

  // Fetch stats by source
  const { data: sourceStats, isLoading: isLoadingSources } = useQuery({
    queryKey: ['commercial-stats-sources', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = startOfMonth(setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear)));
      const endDate = endOfMonth(startDate);

      console.log('Buscando estatísticas por origem:', { startDate, endDate });

      const { data, error } = await supabase
        .from('commercial_source_stats')
        .select('*')
        .gte('month_year', startDate.toISOString())
        .lte('month_year', endDate.toISOString());

      if (error) throw error;
      
      return data.map(stat => ({
        id: stat.source_id,
        name: stat.source_name,
        newClients: stat.new_clients,
        contactAttempts: stat.contact_attempts,
        effectiveContacts: stat.effective_contacts,
        ceConversionRate: stat.ce_conversion_rate,
        scheduledVisits: stat.scheduled_visits,
        agConversionRate: stat.ag_conversion_rate,
        awaitingVisits: stat.awaiting_visits,
        completedVisits: stat.completed_visits,
        atConversionRate: stat.at_conversion_rate,
        enrollments: stat.enrollments
      }));
    }
  });

  const renderTable = (title: string, data: CommercialStats[] | undefined, isLoading: boolean) => (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent [&>th]:px-2.5">
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">{title.split(" ")[2]}</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Novos\nClientes"}</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Total de\nContatos"}</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Contatos\nEfetivos"}</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">% CE</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Visitas\nAgendadas"}</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">% AG</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Visitas\nAguardadas"}</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Visitas\nRealizadas"}</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">% AT</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold">{"Matrí-\nculas"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-xs py-3 px-2.5">Carregando...</TableCell>
            </TableRow>
          ) : (
            data?.map(stat => (
              <TableRow key={stat.id} className="hover:bg-muted/50 [&>td]:px-2.5">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{stat.name}</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{stat.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{stat.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{stat.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{stat.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-[5px]">{stat.enrollments}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Gestão Comercial</h1>
        
        <div className="flex flex-wrap gap-4 justify-start">
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

        {renderTable("Dados por Unidade", unitStats, isLoadingUnits)}
        {renderTable("Dados por Usuário", userStats, isLoadingUsers)}
        {renderTable("Dados por Origem", sourceStats, isLoadingSources)}
      </div>
    </div>
  );
}
