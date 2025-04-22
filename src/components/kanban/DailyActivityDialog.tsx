
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDailyActivityStats } from './hooks/useDailyActivityStats';
import { format } from 'date-fns';
import { useUnit } from '@/contexts/UnitContext';
import { ptBR } from 'date-fns/locale';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export function DailyActivityDialog({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void 
}) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { selectedUnitId } = useUnit();

  const { data: dailyStats = [], isLoading } = useDailyActivityStats(
    selectedMonth, 
    selectedYear, 
    selectedUnitId
  );

  const totalStats = dailyStats.reduce((acc, day) => ({
    tentativa_contato: acc.tentativa_contato + day.tentativa_contato,
    contato_efetivo: acc.contato_efetivo + day.contato_efetivo,
    atendimento_agendado: acc.atendimento_agendado + day.atendimento_agendado,
    atendimento_realizado: acc.atendimento_realizado + day.atendimento_realizado,
    matricula: acc.matricula + day.matricula
  }), {
    tentativa_contato: 0,
    contato_efetivo: 0,
    atendimento_agendado: 0,
    atendimento_realizado: 0,
    matricula: 0
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Painel de Atividades Diárias</DialogTitle>
        </DialogHeader>
        
        <div className="flex space-x-4 mb-4">
          <div>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
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
          
          <div>
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tentativa de Contato</TableHead>
                <TableHead>Contato Efetivo</TableHead>
                <TableHead>Atendimento Agendado</TableHead>
                <TableHead>Atendimento Realizado</TableHead>
                <TableHead>Matrículas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyStats.map((day) => (
                <TableRow key={day.data.toString()}>
                  <TableCell>
                    {format(new Date(day.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{day.tentativa_contato}</TableCell>
                  <TableCell>{day.contato_efetivo}</TableCell>
                  <TableCell>{day.atendimento_agendado}</TableCell>
                  <TableCell>{day.atendimento_realizado}</TableCell>
                  <TableCell>{day.matricula}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-gray-100">
                <TableCell>Total</TableCell>
                <TableCell>{totalStats.tentativa_contato}</TableCell>
                <TableCell>{totalStats.contato_efetivo}</TableCell>
                <TableCell>{totalStats.atendimento_agendado}</TableCell>
                <TableCell>{totalStats.atendimento_realizado}</TableCell>
                <TableCell>{totalStats.matricula}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
