
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "./DateRangePicker";
import { useLeadFunnelStats, DateRangeType } from "@/hooks/useLeadFunnelStats";
import { useUnit } from "@/contexts/UnitContext";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Importando o novo componente de gráfico de barras horizontais
import { HorizontalBarFunnelChart } from './components/HorizontalBarFunnelChart';
import { FunnelSummary } from './components/FunnelSummary';
import { 
  prepareBasicFunnelData, 
  formatNumber,
  formatPercent
} from './utils/funnelChartUtils';

/**
 * Componente principal do funil de conversão de leads
 * Gerencia o estado, busca os dados e coordena a renderização
 */
export function LeadFunnelChart() {
  console.log('Renderizando LeadFunnelChart');
  
  // Alteração principal: usar selectedUnitIds ao invés de selectedUnitId
  const { selectedUnitIds } = useUnit();
  const [dateRange, setDateRange] = useState<DateRangeType>('current-month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  useEffect(() => {
    console.log('LeadFunnelChart - Unidades selecionadas:', selectedUnitIds);
  }, [selectedUnitIds]);
  
  const handleDateRangeChange = (type: DateRangeType, range?: DateRange) => {
    console.log('Alterando range de data:', { type, range });
    setDateRange(type);
    if (type === 'custom' && range) {
      setCustomRange(range);
    }
  };
  
  // Modificando para usar o array de IDs de unidades
  const { data: funnelStats, isLoading, error } = useLeadFunnelStats(
    selectedUnitIds,
    dateRange,
    customRange?.from,
    customRange?.to
  );
  
  useEffect(() => {
    console.log('Dados do funil recebidos:', funnelStats);
    if (error) {
      console.error('Erro ao buscar dados do funil:', error);
    }
  }, [funnelStats, error]);
  
  // Preparar os dados para o gráfico
  const basicChartData = prepareBasicFunnelData(funnelStats);
  
  // Renderização para os diferentes estados
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Funil de Conversão de Leads</CardTitle>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
            customRange={customRange}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Funil de Conversão de Leads</CardTitle>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
            customRange={customRange}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center flex-col">
            <p className="text-red-500">Erro ao carregar dados do funil</p>
            <p className="text-sm text-muted-foreground">{String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Modificamos esta condição para verificar o array de unidades
  if (!funnelStats) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Funil de Conversão de Leads</CardTitle>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
            customRange={customRange}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            {selectedUnitIds && selectedUnitIds.length > 0 ? 
              "Nenhum dado disponível para o período selecionado" : 
              "Nenhuma unidade selecionada"}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CardTitle>Funil de Conversão de Leads</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Mostra a conversão de leads por etapa, baseado no histórico de atividades de cada lead
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={handleDateRangeChange}
          customRange={customRange}
        />
      </CardHeader>
      <CardContent>
        {/* Substituindo o componente de funil simétrico pelo gráfico de barras horizontais */}
        <HorizontalBarFunnelChart 
          data={basicChartData} 
          formatNumber={formatNumber}
        />
        
        {/* Mantendo o componente de resumo das estatísticas */}
        <FunnelSummary 
          data={basicChartData}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      </CardContent>
    </Card>
  );
}
