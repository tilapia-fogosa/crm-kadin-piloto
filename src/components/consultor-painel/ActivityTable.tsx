
import React from 'react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { DailyActivityData } from './types/consultor-activities.types';

/**
 * Interface para as props do componente ActivityTable
 */
interface ActivityTableProps {
  data: DailyActivityData[];
  selectedMonth: number;
  selectedYear: number;
}

/**
 * Componente que exibe a tabela de atividades diárias
 */
export function ActivityTable({ data, selectedMonth, selectedYear }: ActivityTableProps) {
  console.log('[ACTIVITY TABLE] Renderizando tabela com', data.length, 'registros');

  // Função para formatar a data no padrão brasileiro
  const formatDateString = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        console.error('[ACTIVITY TABLE] Data inválida:', dateString);
        return 'Data inválida';
      }
      
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('[ACTIVITY TABLE] Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  // Calcular totais para o footer
  const totals = data.reduce(
    (acc, day) => {
      acc.tentativa_contato += day.tentativa_contato || 0;
      acc.contato_efetivo += day.contato_efetivo || 0;
      acc.atendimento_agendado += day.atendimento_agendado || 0;
      acc.atendimento_realizado += day.atendimento_realizado || 0;
      acc.matriculas += day.matriculas || 0;
      return acc;
    },
    {
      tentativa_contato: 0,
      contato_efetivo: 0,
      atendimento_agendado: 0,
      atendimento_realizado: 0,
      matriculas: 0
    }
  );

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data</TableHead>
              <TableHead className="text-center">Tentativas de Contato</TableHead>
              <TableHead className="text-center">Contatos Efetivos</TableHead>
              <TableHead className="text-center">Atendimentos Agendados</TableHead>
              <TableHead className="text-center">Atendimentos Realizados</TableHead>
              <TableHead className="text-center">Matrículas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((day) => (
                <TableRow key={day.dia}>
                  <TableCell className="font-medium">
                    {formatDateString(day.dia)}
                  </TableCell>
                  <TableCell className="text-center">{day.tentativa_contato || 0}</TableCell>
                  <TableCell className="text-center">{day.contato_efetivo || 0}</TableCell>
                  <TableCell className="text-center">{day.atendimento_agendado || 0}</TableCell>
                  <TableCell className="text-center">{day.atendimento_realizado || 0}</TableCell>
                  <TableCell className="text-center">{day.matriculas || 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhuma atividade encontrada para o período selecionado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* Footer com totais */}
          {data.length > 0 && (
            <tfoot>
              <tr className="border-t bg-muted/50">
                <td className="p-4 pl-4 font-medium">Totais</td>
                <td className="p-4 text-center font-medium">{totals.tentativa_contato}</td>
                <td className="p-4 text-center font-medium">{totals.contato_efetivo}</td>
                <td className="p-4 text-center font-medium">{totals.atendimento_agendado}</td>
                <td className="p-4 text-center font-medium">{totals.atendimento_realizado}</td>
                <td className="p-4 text-center font-medium">{totals.matriculas}</td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>
    </Card>
  );
}
