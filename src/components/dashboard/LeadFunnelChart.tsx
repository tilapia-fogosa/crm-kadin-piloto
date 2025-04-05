
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList,
  Rectangle,
  Cell
} from "recharts";
import { DateRangePicker } from "./DateRangePicker";
import { useLeadFunnelStats, DateRangeType } from "@/hooks/useLeadFunnelStats";
import { useUnit } from "@/contexts/UnitContext";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Componente FunnelBar modificado para ter as barras mais próximas umas das outras
const FunnelBar = (props: any) => {
  console.log("Renderizando FunnelBar com props:", props);
  
  const { x, y, width, height, fill, index, dataLength } = props;
  
  // Reduzindo o espaçamento entre as barras e alterando a lógica de diminuição
  // para manter a aparência de funil
  const widthRatio = 1 - (index * 0.08); // Reduzido de 0.15 para 0.08
  const adjustedWidth = width * widthRatio;
  const xOffset = (width - adjustedWidth) / 2;
  
  // Ajustando o Y para aproximar as barras
  const yAdjustment = index > 0 ? 8 : 0; // Move as barras mais próximas, exceto a primeira
  
  return (
    <Rectangle
      x={x + xOffset}
      y={y - yAdjustment * index} // Ajusta o Y para aproximar as barras
      width={adjustedWidth}
      height={height}
      fill={fill}
      radius={[0, 4, 4, 0]}
    />
  );
};

export function LeadFunnelChart() {
  console.log('Renderizando LeadFunnelChart');
  
  const { selectedUnitId } = useUnit();
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  useEffect(() => {
    console.log('LeadFunnelChart - Unidade selecionada:', selectedUnitId);
  }, [selectedUnitId]);
  
  const handleDateRangeChange = (type: DateRangeType, range?: DateRange) => {
    console.log('Alterando range de data:', { type, range });
    setDateRange(type);
    if (type === 'custom' && range) {
      setCustomRange(range);
    }
  };
  
  const { data: funnelStats, isLoading, error } = useLeadFunnelStats(
    selectedUnitId,
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
  
  const prepareChartData = () => {
    if (!funnelStats) return [];
    
    return [
      {
        name: 'Leads',
        valor: funnelStats.totalLeads,
        taxa: 100,
        legenda: 'Leads Recebidos',
        color: "#3b82f6"
      },
      {
        name: 'Contatos',
        valor: funnelStats.effectiveContacts,
        taxa: funnelStats.effectiveContactRate,
        legenda: 'Contatos Efetivos',
        color: "#10b981"
      },
      {
        name: 'Agendamentos',
        valor: funnelStats.scheduledVisits,
        taxa: funnelStats.scheduledVisitsRate,
        legenda: 'Agendamentos',
        color: "#f59e0b"
      },
      {
        name: 'Atendimentos',
        valor: funnelStats.completedVisits,
        taxa: funnelStats.completedVisitsRate,
        legenda: 'Atendimentos',
        color: "#6366f1"
      },
      {
        name: 'Matrículas',
        valor: funnelStats.enrollments,
        taxa: funnelStats.enrollmentsRate,
        legenda: 'Matrículas',
        color: "#ec4899"
      }
    ];
  };
  
  const chartData = prepareChartData();
  
  const chartConfig = {
    lead: { color: "#3b82f6" },
    contato: { color: "#10b981" },
    agendamento: { color: "#f59e0b" },
    atendimento: { color: "#6366f1" },
    matricula: { color: "#ec4899" }
  };
  
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
            {selectedUnitId ? 
              "Nenhum dado disponível para o período selecionado" : 
              "Nenhuma unidade selecionada"}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
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
                  Mostra a conversão de leads por etapa (cada lead contado apenas uma vez em cada etapa)
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
        <div className="h-[350px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                barGap={0}
                barSize={30} // Reduzido para criar barras mais juntas
                margin={{
                  top: 20,
                  right: 50,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={formatNumber} 
                  domain={[0, 'dataMax']}
                />
                <YAxis 
                  type="category" 
                  dataKey="legenda" 
                  width={120} 
                  tickLine={false}
                  interval={0} // Garante que todas as etiquetas são mostradas
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent 
                      formatter={(value: any, name: any, props: any) => {
                        if (name === 'valor') return [formatNumber(value), 'Quantidade'];
                        if (name === 'taxa') return [formatPercent(value), 'Taxa de Conversão'];
                        return [value, name];
                      }}
                    />
                  }
                />
                <Bar 
                  dataKey="valor" 
                  name="Quantidade" 
                  shape={<FunnelBar />}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="valor" 
                    position="right" 
                    formatter={formatNumber} 
                    style={{ fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4 p-2 bg-slate-50 rounded-md">
          {chartData.map((item, index) => (
            <div key={index} className="text-center p-2 border-r last:border-r-0 border-slate-200">
              <div className="text-sm font-medium">{item.legenda}</div>
              <div className="text-lg font-bold">{formatNumber(item.valor)}</div>
              <div className="text-xs text-muted-foreground">{formatPercent(item.taxa)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
