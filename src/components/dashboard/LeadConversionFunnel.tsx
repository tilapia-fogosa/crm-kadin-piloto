
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
  unitId: string | null;
}

export function LeadConversionFunnel({ unitId }: LeadConversionFunnelProps) {
  console.log('Renderizando LeadConversionFunnel para unidade:', unitId);
  
  const [dateRange, setDateRange] = useState<DateRangeType>('current-month');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const { data: funnelData, isLoading, error } = useLeadFunnelConversion(
    unitId,
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

  // Preparar os dados para o gráfico
  const basicChartData = prepareBasicFunnelData(funnelData);
  const symmetricalData = transformDataForSymmetricalFunnel(basicChartData);
  
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
              {!unitId ? "Selecione uma unidade" : "Nenhum dado disponível para o período"}
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

