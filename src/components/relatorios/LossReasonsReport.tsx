import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Filter, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LossReasonData {
  motivo_perda: string;
  novo_cadastro: number;
  tentativa_contato: number;
  contato_efetivo: number;
  atendimento_agendado: number;
  negociacao: number;
  perdido: number;
  sem_status_anterior: number;
  total_motivo: number;
}

interface Filters {
  dateRange: 'custom' | '7days' | '30days' | 'currentMonth' | 'lastMonth';
  startDate?: Date;
  endDate?: Date;
  unitIds: string[];
  createdByIds: string[];
}

const dateRangeOptions = [
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: 'currentMonth', label: 'Mês atual' },
  { value: 'lastMonth', label: 'Mês anterior' },
  { value: 'custom', label: 'Período personalizado' },
];

export function LossReasonsReport() {
  const [filters, setFilters] = useState<Filters>({
    dateRange: '30days',
    unitIds: [],
    createdByIds: [],
  });

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case '7days':
        return {
          start: format(subDays(now, 7), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd HH:mm:ss')
        };
      case '30days':
        return {
          start: format(subDays(now, 30), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd HH:mm:ss')
        };
      case 'currentMonth':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd HH:mm:ss')
        };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd HH:mm:ss')
        };
      case 'custom':
        return {
          start: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : format(subDays(now, 30), 'yyyy-MM-dd'),
          end: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd HH:mm:ss') : format(now, 'yyyy-MM-dd HH:mm:ss')
        };
      default:
        return {
          start: format(subDays(now, 30), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd HH:mm:ss')
        };
    }
  };

  // Fetch available units
  const { data: units } = useQuery({
    queryKey: ['units-for-loss-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch available users
  const { data: users } = useQuery({
    queryKey: ['users-for-loss-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch loss reasons report
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['loss-reasons-report', filters],
    queryFn: async () => {
      const { start, end } = getDateRange();
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data, error } = await supabase.rpc('get_loss_reasons_report', {
        p_start_date: start,
        p_end_date: end,
        p_unit_ids: filters.unitIds.length > 0 ? filters.unitIds : null,
        p_created_by_ids: filters.createdByIds.length > 0 ? filters.createdByIds : null,
        p_current_user_id: currentUserId,
      });

      if (error) throw error;
      return (data || []) as LossReasonData[];
    },
  });

  // Calculate column totals
  const columnTotals = reportData?.reduce((totals, row) => ({
    novo_cadastro: totals.novo_cadastro + row.novo_cadastro,
    tentativa_contato: totals.tentativa_contato + row.tentativa_contato,
    contato_efetivo: totals.contato_efetivo + row.contato_efetivo,
    atendimento_agendado: totals.atendimento_agendado + row.atendimento_agendado,
    negociacao: totals.negociacao + row.negociacao,
    perdido: totals.perdido + row.perdido,
    sem_status_anterior: totals.sem_status_anterior + row.sem_status_anterior,
    total_motivo: totals.total_motivo + row.total_motivo,
  }), {
    novo_cadastro: 0,
    tentativa_contato: 0,
    contato_efetivo: 0,
    atendimento_agendado: 0,
    negociacao: 0,
    perdido: 0,
    sem_status_anterior: 0,
    total_motivo: 0,
  });

  const resetFilters = () => {
    setFilters({
      dateRange: '30days',
      unitIds: [],
      createdByIds: [],
    });
    setDateRange({});
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
          <CardDescription>
            Configure os filtros para personalizar o relatório de motivos de perda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período personalizado */}
            {filters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => {
                          setDateRange({ ...dateRange, from: date });
                          setFilters({ ...filters, startDate: date });
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data fim</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? (
                          format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecionar data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => {
                          setDateRange({ ...dateRange, to: date });
                          setFilters({ ...filters, endDate: date });
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Unidades */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidades</label>
              <Select
                value={filters.unitIds.length === 1 ? filters.unitIds[0] : ""}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters({ ...filters, unitIds: [] });
                  } else {
                    setFilters({ ...filters, unitIds: [value] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usuários */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Criado por</label>
              <Select
                value={filters.createdByIds.length === 1 ? filters.createdByIds[0] : ""}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters({ ...filters, createdByIds: [] });
                  } else {
                    setFilters({ ...filters, createdByIds: [value] });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Usuário sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => refetch()} size="sm">
              Atualizar Relatório
            </Button>
            <Button onClick={resetFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Motivos de Perda por Status</CardTitle>
          <CardDescription>
            Distribuição dos motivos de perda por status anterior do cliente no funil
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Motivo de Perda</TableHead>
                    <TableHead className="text-center">Novo Cadastro</TableHead>
                    <TableHead className="text-center">Tentativa Contato</TableHead>
                    <TableHead className="text-center">Contato Efetivo</TableHead>
                    <TableHead className="text-center">Atend. Agendado</TableHead>
                    <TableHead className="text-center">Negociação</TableHead>
                    <TableHead className="text-center">Perdido</TableHead>
                    <TableHead className="text-center">Sem Status</TableHead>
                    <TableHead className="text-center font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.motivo_perda}</TableCell>
                      <TableCell className="text-center">
                        {row.novo_cadastro > 0 ? (
                          <Badge variant="secondary">{row.novo_cadastro}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.tentativa_contato > 0 ? (
                          <Badge variant="secondary">{row.tentativa_contato}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.contato_efetivo > 0 ? (
                          <Badge variant="secondary">{row.contato_efetivo}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.atendimento_agendado > 0 ? (
                          <Badge variant="secondary">{row.atendimento_agendado}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.negociacao > 0 ? (
                          <Badge variant="secondary">{row.negociacao}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.perdido > 0 ? (
                          <Badge variant="secondary">{row.perdido}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.sem_status_anterior > 0 ? (
                          <Badge variant="secondary">{row.sem_status_anterior}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{row.total_motivo}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Linha de totais */}
                  {columnTotals && (
                    <TableRow className="border-t-2 font-semibold bg-muted/30">
                      <TableCell className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.novo_cadastro}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.tentativa_contato}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.contato_efetivo}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.atendimento_agendado}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.negociacao}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.perdido}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{columnTotals.sem_status_anterior}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-primary">{columnTotals.total_motivo}</Badge>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {(!reportData || reportData.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado encontrado para os filtros selecionados.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}