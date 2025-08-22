import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter, RotateCcw, TrendingUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MultipleUnitSelect } from "@/components/auth/MultipleUnitSelect";
import { MultipleUserSelect } from "@/components/auth/MultipleUserSelect";

/**
 * Log: Interface para dados do relatório de motivos de perda
 * Define a estrutura dos dados retornados pela RPC function get_loss_reasons_report
 */
interface LossReasonData {
  motivo_perda: string;
  novo_cadastro: number;
  tentativa_contato: number;
  contato_efetivo: number;
  atendimento_agendado: number;
  negociacao: number;
  perdido: number;
  total_motivo: number;
}

/**
 * Log: Interface para dados do relatório temporal
 * Define a estrutura dos dados retornados pela RPC function get_temporal_loss_reasons_report
 */
interface TemporalLossReasonData {
  motivo_perda: string;
  mes_1_count: number; mes_1_percent: number; mes_1_header: string;
  mes_2_count: number; mes_2_percent: number; mes_2_header: string;
  mes_3_count: number; mes_3_percent: number; mes_3_header: string;
  mes_4_count: number; mes_4_percent: number; mes_4_header: string;
  mes_5_count: number; mes_5_percent: number; mes_5_header: string;
  mes_6_count: number; mes_6_percent: number; mes_6_header: string;
}

/**
 * Log: Interface para filtros do relatório
 * Permite filtrar por período, unidades e usuários usando multi-select
 */
interface Filters {
  dateRange: 'custom' | '7days' | '30days' | 'currentMonth' | 'lastMonth';
  startDate?: Date;
  endDate?: Date;
  unitIds: string[];
  createdByIds: string[];
}

/**
 * Log: Opções pré-definidas de períodos de tempo
 * Oferece períodos comuns para facilitar a seleção do usuário
 */
const dateRangeOptions = [
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: 'currentMonth', label: 'Mês atual' },
  { value: 'lastMonth', label: 'Mês anterior' },
  { value: 'custom', label: 'Período personalizado' },
];

/**
 * Log: Componente principal do relatório de motivos de perda
 * Implementa filtros dinâmicos e exibe dados em tabela formatada
 * Segue o padrão de layout dos painéis comerciais e de atividades
 */
export function LossReasonsReport() {
  console.log('Inicializando LossReasonsReport');
  
  // Estado dos filtros com valores padrão
  const [filters, setFilters] = useState<Filters>({
    dateRange: '30days',
    unitIds: [],
    createdByIds: [],
  });

  // Estado para seleção de datas customizadas
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  /**
   * Log: Função para calcular intervalos de data baseados na seleção
   * Converte opções pré-definidas em datas específicas para a consulta SQL
   */
  const getDateRange = () => {
    console.log('Calculando intervalo de datas para:', filters.dateRange);
    
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

  // As queries para units e users são removidas pois agora usamos os componentes multi-select
  // que já fazem suas próprias queries

  /**
   * Log: Query principal para buscar dados do relatório
   * Chama a RPC function get_loss_reasons_report com os filtros aplicados
   */
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['loss-reasons-report', filters],
    queryFn: async () => {
      console.log('Buscando dados do relatório com filtros:', filters);
      
      const { start, end } = getDateRange();
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      console.log('Parâmetros da consulta:', {
        start,
        end,
        unitIds: filters.unitIds,
        createdByIds: filters.createdByIds,
        currentUserId
      });
      
      const { data, error } = await supabase.rpc('get_loss_reasons_report', {
        p_start_date: start,
        p_end_date: end,
        p_unit_ids: filters.unitIds.length > 0 ? filters.unitIds : null,
        p_created_by_ids: filters.createdByIds.length > 0 ? filters.createdByIds : null,
        p_current_user_id: currentUserId,
      });

      if (error) {
        console.error('Erro ao executar RPC:', error);
        throw error;
      }
      
      console.log('Dados do relatório carregados:', data?.length, 'registros');
      return (data || []) as LossReasonData[];
    },
  });

  /**
   * Log: Query para buscar dados do relatório temporal
   * Chama a RPC function get_temporal_loss_reasons_report com os mesmos filtros
   */
  const { data: temporalData, isLoading: isLoadingTemporal, refetch: refetchTemporal } = useQuery({
    queryKey: ['temporal-loss-reasons-report', filters],
    queryFn: async () => {
      console.log('Buscando dados do relatório temporal com filtros:', filters);
      
      const { start, end } = getDateRange();
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data, error } = await supabase.rpc('get_temporal_loss_reasons_report', {
        p_start_date: start,
        p_end_date: end,
        p_unit_ids: filters.unitIds.length > 0 ? filters.unitIds : null,
        p_created_by_ids: filters.createdByIds.length > 0 ? filters.createdByIds : null,
        p_current_user_id: currentUserId,
      });

      if (error) {
        console.error('Erro ao executar RPC temporal:', error);
        throw error;
      }
      
      console.log('Dados do relatório temporal carregados:', data?.length, 'registros');
      return (data || []) as TemporalLossReasonData[];
    },
  });

  /**
   * Log: Cálculo de totais por coluna
   * Soma todos os valores de cada status para exibir na linha de totais
   */
  const columnTotals = reportData?.reduce((totals, row) => ({
    novo_cadastro: totals.novo_cadastro + row.novo_cadastro,
    tentativa_contato: totals.tentativa_contato + row.tentativa_contato,
    contato_efetivo: totals.contato_efetivo + row.contato_efetivo,
    atendimento_agendado: totals.atendimento_agendado + row.atendimento_agendado,
    negociacao: totals.negociacao + row.negociacao,
    perdido: totals.perdido + row.perdido,
    total_motivo: totals.total_motivo + row.total_motivo,
  }), {
    novo_cadastro: 0,
    tentativa_contato: 0,
    contato_efetivo: 0,
    atendimento_agendado: 0,
    negociacao: 0,
    perdido: 0,
    total_motivo: 0,
  });

  /**
   * Log: Função para resetar todos os filtros
   * Retorna aos valores padrão para nova consulta
   */
  const resetFilters = () => {
    console.log('Resetando filtros do relatório');
    
    setFilters({
      dateRange: '30days',
      unitIds: [],
      createdByIds: [],
    });
    setDateRange({});
  };

  /**
   * Log: Função para refazer ambas as consultas
   * Atualiza tanto o relatório principal quanto o temporal
   */
  const refetchAll = () => {
    console.log('Atualizando todos os relatórios');
    refetch();
    refetchTemporal();
  };

  return (
    <div className="space-y-6">
      {/* Card de Filtros */}
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
            {/* Seletor de Período */}
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

            {/* Período personalizado - só aparece quando "custom" selecionado */}
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

            {/* Multi-seletor de Unidades */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidades</label>
              <MultipleUnitSelect
                selectedUnits={filters.unitIds}
                onUnitsChange={(unitIds) => setFilters({ ...filters, unitIds })}
              />
            </div>

            {/* Multi-seletor de Usuários */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Criado por</label>
              <MultipleUserSelect
                selectedUsers={filters.createdByIds}
                onUsersChange={(userIds) => setFilters({ ...filters, createdByIds: userIds })}
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 mt-4">
            <Button onClick={refetchAll} size="sm">
              Atualizar Relatórios
            </Button>
            <Button onClick={resetFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card com Tabela de Resultados - Layout seguindo padrão dos outros painéis */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Motivos de Perda por Status</CardTitle>
          <CardDescription>
            Distribuição dos motivos de perda por status anterior do cliente no funil
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Tabela seguindo o padrão do painel de atividades */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:px-2.5">
                    <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">Motivo de Perda</TableHead>
                    <TableHead className="text-center whitespace-pre-line text-xs font-semibold">
                      {"Novo\nCadastro"}
                    </TableHead>
                    <TableHead className="text-center whitespace-pre-line text-xs font-semibold">
                      {"Tentativa\nContato"}
                    </TableHead>
                    <TableHead className="text-center whitespace-pre-line text-xs font-semibold">
                      {"Contato\nEfetivo"}
                    </TableHead>
                    <TableHead className="text-center whitespace-pre-line text-xs font-semibold">
                      {"Atend.\nAgendado"}
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold">Negociação</TableHead>
                    <TableHead className="text-center text-xs font-semibold">Perdido</TableHead>
                    <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">Total</TableHead>
                    <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Renderização das linhas de dados */}
                  {reportData?.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 [&>td]:px-2.5">
                      <TableCell className="text-left bg-[#FEC6A1] text-xs py-0 font-medium">
                        {row.motivo_perda}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.novo_cadastro > 0 ? row.novo_cadastro : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.tentativa_contato > 0 ? row.tentativa_contato : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.contato_efetivo > 0 ? row.contato_efetivo : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.atendimento_agendado > 0 ? row.atendimento_agendado : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.negociacao > 0 ? row.negociacao : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.perdido > 0 ? row.perdido : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0 bg-[#FEC6A1] font-semibold">
                        {row.total_motivo}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0 bg-[#FEC6A1] font-semibold">
                        {columnTotals && columnTotals.total_motivo > 0
                          ? `${((row.total_motivo / columnTotals.total_motivo) * 100).toFixed(1)}%`
                          : '0.0%'
                        }
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Linha de totais seguindo padrão dos outros painéis */}
                  {columnTotals && (
                    <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-bold border-t-2">
                      <TableCell className="text-left bg-[#FEC6A1] text-xs py-0 font-bold">TOTAL</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.novo_cadastro}</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.tentativa_contato}</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.contato_efetivo}</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.atendimento_agendado}</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.negociacao}</TableCell>
                      <TableCell className="text-center text-xs py-0">{columnTotals.perdido}</TableCell>
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0 font-bold">
                        {columnTotals.total_motivo}
                      </TableCell>
                      <TableCell className="text-center bg-[#FEC6A1] text-xs py-0 font-bold">
                        100.0%
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Mensagem quando não há dados */}
              {(!reportData || reportData.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado encontrado para os filtros selecionados
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segundo Relatório - Evolução Temporal dos Motivos de Perda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução Temporal dos Motivos de Perda
          </CardTitle>
          <CardDescription>
            Distribuição mensal dos motivos de perda nos últimos 6 meses (count e percentual)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingTemporal ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:px-2.5">
                    <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold sticky left-0">
                      Motivo de Perda
                    </TableHead>
                    {/* Gerar headers dinâmicos para os 6 meses */}
                    {temporalData && temporalData.length > 0 && (
                      <>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_1_header}
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_2_header}
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_3_header}
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_4_header}
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_5_header}
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold" colSpan={2}>
                          {temporalData[0].mes_6_header}
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                  <TableRow className="hover:bg-transparent [&>th]:px-2.5">
                    <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold sticky left-0">
                      {/* Espaço vazio para alinhar com a linha de cima */}
                    </TableHead>
                    {/* Sub-headers N e %N para cada mês */}
                    {Array.from({ length: 6 }, (_, index) => (
                      <React.Fragment key={index}>
                        <TableHead className="text-center text-xs font-semibold">N</TableHead>
                        <TableHead className="text-center text-xs font-semibold">%N</TableHead>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temporalData?.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 [&>td]:px-2.5">
                      <TableCell className="text-left bg-[#FEC6A1] text-xs py-0 font-medium sticky left-0">
                        {row.motivo_perda}
                      </TableCell>
                      
                      {/* Mês 1 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_1_count > 0 ? row.mes_1_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_1_percent > 0 ? `${row.mes_1_percent}%` : '-'}
                      </TableCell>
                      
                      {/* Mês 2 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_2_count > 0 ? row.mes_2_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_2_percent > 0 ? `${row.mes_2_percent}%` : '-'}
                      </TableCell>
                      
                      {/* Mês 3 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_3_count > 0 ? row.mes_3_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_3_percent > 0 ? `${row.mes_3_percent}%` : '-'}
                      </TableCell>
                      
                      {/* Mês 4 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_4_count > 0 ? row.mes_4_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_4_percent > 0 ? `${row.mes_4_percent}%` : '-'}
                      </TableCell>
                      
                      {/* Mês 5 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_5_count > 0 ? row.mes_5_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_5_percent > 0 ? `${row.mes_5_percent}%` : '-'}
                      </TableCell>
                      
                      {/* Mês 6 */}
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_6_count > 0 ? row.mes_6_count : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs py-0">
                        {row.mes_6_percent > 0 ? `${row.mes_6_percent}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Mensagem quando não há dados temporais */}
              {!temporalData || temporalData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum dado temporal encontrado para os filtros aplicados.</p>
                  <p className="text-sm mt-2">Tente ajustar os filtros ou período selecionado.</p>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}