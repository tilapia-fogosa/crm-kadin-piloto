/**
 * LOG: Componente principal do dashboard de comissões
 * DESCRIÇÃO: Exibe resumo mensal de comissões com filtros e detalhamento
 * PERMISSÕES: Consultores veem apenas suas comissões, Franqueados/Admins veem todas
 */

import React, { useState, useMemo } from "react";
import { CommissionConfigModal } from "./CommissionConfigModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useUnit } from "@/contexts/UnitContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCommissionSummary, useCommissionSaleDetails, useCalculateCommission, useConsolidateCommission } from "@/hooks/useCommissionCalculations";
import { useAutoRecalculateCommissions } from "@/hooks/useAutoRecalculateCommissions";
import { format, subMonths, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function Comissoes() {
  const { selectedUnitId } = useUnit();
  const unitId = selectedUnitId;
  const { role, canConfigureCommissions, isLoading: isLoadingRole } = useUserRole(unitId || undefined);
  
  // Estados de filtros
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // Armazena calculation_id
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Auto-recálculo de comissões com debounce de 10 segundos
  const { isRecalculating } = useAutoRecalculateCommissions({
    unitId: unitId || '',
    consultantId: selectedConsultant,
    enabled: !!unitId && !!selectedConsultant
  });

  // Calcular últimos 6 meses
  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      months.push(format(date, 'yyyy-MM'));
    }
    return months;
  }, []);

  const startMonth = last6Months[last6Months.length - 1];
  const endMonth = last6Months[0];

  // Buscar resumo de comissões
  const { data: summary, isLoading: isLoadingSummary } = useCommissionSummary({
    unitId: unitId || '',
    consultantId: selectedConsultant,
    startMonth,
    endMonth,
  });

  // Buscar detalhes de vendas quando expandir linha
  const { data: saleDetails, isLoading: isLoadingDetails } = useCommissionSaleDetails(expandedRow || undefined);

  // Mutations
  const calculateCommission = useCalculateCommission();
  const consolidateCommission = useConsolidateCommission();

  // Agrupar por mês para exibição
  const monthlyData = useMemo(() => {
    if (!summary) return [];

    return last6Months.map(month => {
      const monthData = summary.filter(s => s.month === month);
      const totalSales = monthData.reduce((acc, curr) => acc + curr.total_sales, 0);
      const totalCommission = monthData.reduce((acc, curr) => acc + Number(curr.total_commission), 0);
      const isConsolidated = monthData.every(s => s.is_consolidated);
      const salesConfirmed = monthData.reduce((acc, curr) => acc + (curr.sales_confirmed || 0), 0);
      const salesPending = monthData.reduce((acc, curr) => acc + (curr.sales_pending || 0), 0);

      return {
        month,
        totalSales,
        totalCommission,
        isConsolidated,
        salesConfirmed,
        salesPending,
        details: monthData,
      };
    });
  }, [summary, last6Months]);

  // Loading state
  if (isLoadingRole || !unitId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Se não tem permissão
  if (!role) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta funcionalidade.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header com botão de configuração */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comissões</h2>
          <p className="text-muted-foreground">
            Acompanhe suas comissões e resultados de vendas
          </p>
        </div>
            {canConfigureCommissions && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsConfigModalOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Fórmula
              </Button>
            )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Mês Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `R$ ${monthlyData[0]?.totalCommission.toFixed(2) || '0,00'}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyData[0]?.totalSales || 0} vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Média 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `R$ ${(monthlyData.reduce((acc, m) => acc + m.totalCommission, 0) / 6).toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {format(new Date(endMonth + '-01'), 'MMM/yyyy', { locale: ptBR })} - {format(new Date(startMonth + '-01'), 'MMM/yyyy', { locale: ptBR })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de resumo mensal */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
          <CardDescription>
            Comissões dos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Indicador de recálculo automático */}
          {isRecalculating && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Recalculando comissões automaticamente...
              </span>
            </div>
          )}
          {isLoadingSummary ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Vendas em Confirmação</TableHead>
                  <TableHead className="text-right">Vendas Confirmadas</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((monthData) => (
                  <React.Fragment key={monthData.month}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        const calcId = monthData.details[0]?.calculation_id || monthData.details[0]?.id || null;
                        setExpandedRow(expandedRow === calcId ? null : calcId);
                      }}
                    >
                      <TableCell className="font-medium">
                        {format(parse(monthData.month, 'yyyy-MM', new Date()), "MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {monthData.salesPending}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {monthData.salesConfirmed}
                      </TableCell>
                      <TableCell className="text-right text-primary font-semibold">
                        R$ {monthData.totalCommission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {expandedRow === (monthData.details[0]?.calculation_id || monthData.details[0]?.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* Linha expansível com detalhes */}
                    {expandedRow === (monthData.details[0]?.calculation_id || monthData.details[0]?.id) && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-4">
                          {isLoadingDetails ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
                            </div>
                          ) : saleDetails && saleDetails.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold mb-3">Detalhes das Vendas</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="text-center">Matrícula Paga</TableHead>
                                    <TableHead className="text-center">Material Pago</TableHead>
                                    <TableHead className="text-right">Comissão Calculada</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {saleDetails.map((sale) => (
                                    <TableRow key={sale.id}>
                                      <TableCell>{sale.client_name}</TableCell>
                                      <TableCell className="text-center">
                                        {sale.atividade_pos_venda?.enrollment_payment_confirmed ? (
                                          <Badge variant="default">Sim ✓</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-white">Não ✗</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {sale.atividade_pos_venda?.material_payment_confirmed ? (
                                          <Badge variant="default">Sim ✓</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-white">Não ✗</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {sale.sale_commission > 0 ? (
                                          <span className="text-green-600 dark:text-green-400">
                                            R$ {sale.sale_commission.toFixed(2)}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            R$ 0,00
                                          </span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">Nenhuma venda registrada neste mês.</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CommissionConfigModal 
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        unitId={unitId}
      />
    </div>
  );
}