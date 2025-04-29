import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLeadFunnelConversion } from '@/hooks/useLeadFunnelConversion';
import { DateRangePicker } from "./DateRangePicker";
import { DateRangeType } from "@/hooks/useLeadFunnelStats";
import { DateRange } from "react-day-picker";
import { SymmetricalFunnelChart } from './components/SymmetricalFunnelChart';
import { FunnelSummary } from './components/FunnelSummary';
import { 
  prepareBasicFunnelData, 
  transformDataForSymmetricalFunnel,
  formatNumber,
  formatPercent
} from './utils/funnelChartUtils';

interface LeadConversionFunnelProps {
  unitIds: string[] | null;
}

export function LeadConversionFunnel({ unitIds }: LeadConversionFunnelProps) {
  console.log('Renderizando LeadConversionFunnel para unidades:', unitIds);
  
  const [dateRange, setDateRange] = useState<DateRangeType>('current-month');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const { data: funnelData, isLoading, error } = useLeadFunnelConversion(
    unitIds,
    dateRange,
    dateRange === 'custom' ? customRange.from : undefined,
    dateRange === 'custom' ? customRange.to : undefined
  );

  const handleDateRangeChange = (type: DateRangeType, range?: DateRange) => {
    console.log('Alterando range de data:', { type, range });
    setDateRange(type);
    if (type === 'custom' && range) {
      setCustomRange(range);
    }
  };

  // Log detalhado para depuração
  console.log('Dados do funil recebidos:', funnelData);
  
  // Preparar os dados para o gráfico com tratamento seguro
  const basicChartData = prepareBasicFunnelData(funnelData);
  console.log('Dados básicos do funil preparados:', basicChartData);
  
  const symmetricalData = transformDataForSymmetricalFunnel(basicChartData);
  console.log('Dados transformados para funil simétrico:', symmetricalData);
  
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
          <div className="h-[450px] flex items-center justify-center">
            <Skeleton className="h-[400px] w-full" />
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Erro ao carregar dados do funil de conversão
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!funnelData) {
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
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-muted-foreground">
              {!unitIds || unitIds.length === 0 ? "Selecione uma unidade" : "Nenhum dado disponível para o período"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verifica se os dados do funil estão vazios (sem leads)
  if (basicChartData.length === 0 || basicChartData[0].valor === 0) {
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
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Nenhum lead encontrado para o período selecionado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Funil de Conversão de Leads</CardTitle>
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={handleDateRangeChange}
          customRange={customRange}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de Funil usando Recharts */}
          <div className="h-[450px]">
            <SymmetricalFunnelChart data={symmetricalData} />
          </div>
          
          {/* Resumo do Funil com Números e Taxas */}
          <FunnelSummary 
            data={basicChartData} 
            formatNumber={formatNumber}
            formatPercent={formatPercent}
          />
        </div>
      </CardContent>
    </Card>
  );
}
