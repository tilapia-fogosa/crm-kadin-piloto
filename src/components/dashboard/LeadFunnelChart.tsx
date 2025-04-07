
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import { DateRangePicker } from "./DateRangePicker";
import { useLeadFunnelStats, DateRangeType } from "@/hooks/useLeadFunnelStats";
import { useUnit } from "@/contexts/UnitContext";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";
import { ChartContainer, ChartTooltipContent } from "../ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Componente personalizado para o tooltip
const CustomTooltip = ({ active, payload }: any) => {
  // Log para depuração do tooltip
  console.log("Tooltip payload:", payload);
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-bold text-gray-800">{data.legenda}</p>
        <p className="text-sm text-gray-600">Quantidade: <span className="font-medium">{data.valor}</span></p>
        <p className="text-sm text-gray-600">Taxa de Conversão: <span className="font-medium">{data.taxa.toFixed(1)}%</span></p>
      </div>
    );
  }

  return null;
};

export function LeadFunnelChart() {
  console.log('Renderizando LeadFunnelChart');
  
  const { selectedUnitId } = useUnit();
  const [dateRange, setDateRange] = useState<DateRangeType>('current-month');
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
  
  // Preparar dados para o gráfico de funil simétrico
  const prepareChartData = () => {
    if (!funnelStats) return [];
    
    // Criamos o array de dados para o funil
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
  
  // Função para mapear valores para renderizar o funil simétrico
  const transformDataForSymmetricalFunnel = (data: any[]) => {
    console.log("Transformando dados para funil simétrico:", data);
    
    // Valor máximo para dimensionar o funil
    const maxValue = Math.max(...data.map(item => item.valor)) * 1.2;
    
    return data.map((item, index) => {
      // Calculamos a largura relativa ao valor máximo
      const funnelWidth = (item.valor / maxValue) * 100;
      
      return {
        ...item,
        // Valores para a área esquerda e direita do funil (simétrico)
        left: (100 - funnelWidth) / 2,
        right: (100 - funnelWidth) / 2 + funnelWidth,
        // Para uso no gráfico de área
        valueLeft: (100 - funnelWidth) / 2,
        valueRight: funnelWidth,
        // Para identificar posição no funil
        step: index
      };
    });
  };
  
  const symmetricalData = transformDataForSymmetricalFunnel(chartData);
  
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
        {/* Gráfico de funil simétrico usando áreas */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={symmetricalData}
              margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
              layout="vertical"
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                hide 
              />
              <YAxis 
                dataKey="step" 
                type="number" 
                domain={[0, 4]} 
                hide 
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <defs>
                {symmetricalData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradientLeft${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
                {symmetricalData.map((entry, index) => (
                  <linearGradient key={`gradient-right-${index}`} id={`gradientRight${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {/* Lado esquerdo do funil */}
              <Area 
                dataKey="valueLeft" 
                stackId="1" 
                stroke="none" 
                isAnimationActive={true}
                fill={
                  // Correção do erro aqui: definindo uma string literal em vez de uma função
                  // Solução: usando atributo fillOpacity para dar o efeito gradiente 
                  // e usando cor fixa no fill com transparência
                  "url(#gradientLeft0)"
                }
                name="Left"
              />
              {/* Lado direito do funil */}
              <Area 
                dataKey="valueRight" 
                stackId="1" 
                stroke="none" 
                isAnimationActive={true}
                fill={
                  // Correção do erro aqui: definindo uma string literal em vez de uma função
                  // Solução: usando atributo fillOpacity para dar o efeito gradiente 
                  // e usando cor fixa no fill com transparência
                  "url(#gradientRight0)"
                }
                name="Right"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Labels à esquerda e direita do funil */}
        <div className="relative -mt-[350px] h-[350px] pointer-events-none">
          {symmetricalData.map((item, index) => (
            <div 
              key={index} 
              className="absolute flex justify-between w-full px-8"
              style={{ 
                top: `${20 + (index * 70)}px`, 
              }}
            >
              {/* Label esquerdo */}
              <div className="text-right">
                <span className="font-bold" style={{ color: item.color }}>{item.legenda}</span>
              </div>
              
              {/* Label direito com números */}
              <div className="text-left">
                <span className="font-bold" style={{ color: item.color }}>
                  {formatNumber(item.valor)} <span className="text-sm">({formatPercent(item.taxa)})</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Estatísticas resumidas */}
        <div className="grid grid-cols-5 gap-4 mt-16 p-2 bg-slate-50 rounded-md">
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
