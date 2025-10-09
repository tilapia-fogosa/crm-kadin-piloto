/**
 * LOG: Componente principal do dashboard de comissões
 * DESCRIÇÃO: Exibe resumo mensal de comissões com filtros e detalhamento
 * PERMISSÕES: Consultores veem apenas suas comissões, Franqueados/Admins veem todas
 */

import { useState, useMemo } from "react";
import { CommissionConfigModal } from "./CommissionConfigModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useUnit } from "@/contexts/UnitContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCommissionSummary, useCommissionSaleDetails, useCalculateCommission, useConsolidateCommission } from "@/hooks/useCommissionCalculations";
import { format, subMonths } from "date-fns";
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
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

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

    // LOG: Debug dos dados retornados
    console.log('🔍 [Comissoes] Summary retornado:', summary);
    console.log('🔍 [Comissoes] Últimos 6 meses:', last6Months);

    const grouped = last6Months.map(month => {
      const monthData = summary.filter(s => s.month === month);
      const totalSales = monthData.reduce((acc, curr) => acc + curr.total_sales, 0);
      const totalCommission = monthData.reduce((acc, curr) => acc + curr.total_commission, 0);
      const isConsolidated = monthData.every(s => s.is_consolidated);

      // LOG: Debug de cada mês
      console.log(`🔍 [Comissoes] Mês ${month}:`, {
        monthData,
        totalSales,
        totalCommission,
        isConsolidated,
      });

      return {
        month,
        totalSales,
        totalCommission,
        isConsolidated,
        details: monthData,
      };
    });

    return grouped;
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
              {format(new Date(startMonth + '-01'), 'MMM/yyyy', { locale: ptBR })} - {format(new Date(endMonth + '-01'), 'MMM/yyyy', { locale: ptBR })}
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
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((monthData) => (
                  <>
                    <TableRow 
                      key={monthData.month}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedRow(expandedRow === monthData.month ? null : monthData.month)}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(monthData.month + '-01'), 'MMMM yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        {monthData.totalSales}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {monthData.totalCommission.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {monthData.isConsolidated ? (
                          <Badge variant="default">Pago ✓</Badge>
                        ) : (
                          <Badge variant="secondary">Aberto ⏳</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {expandedRow === monthData.month ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* Linha expansível com detalhes */}
                    {expandedRow === monthData.month && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Detalhamento de Vendas</h4>
                            {isLoadingDetails ? (
                              <Skeleton className="h-24 w-full" />
                            ) : saleDetails && saleDetails.length > 0 ? (
                              <div className="text-sm space-y-1">
                                {saleDetails.map((sale) => (
                                  <div key={sale.id} className="flex justify-between py-1 border-b border-border/50">
                                    <span>{sale.client_name}</span>
                                    <span className="text-muted-foreground">
                                      Matrícula: R$ {sale.enrollment_amount?.toFixed(2) || '0,00'} | 
                                      Material: R$ {sale.material_amount?.toFixed(2) || '0,00'} | 
                                      Mensalidade: R$ {sale.monthly_fee_amount?.toFixed(2) || '0,00'}
                                    </span>
                                    <span className="font-medium">
                                      R$ {sale.sale_commission.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhuma venda neste período</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
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