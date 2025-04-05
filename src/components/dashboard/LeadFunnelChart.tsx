
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  LabelList
} from "recharts";
import { DateRangePicker } from "./DateRangePicker";
import { useLeadFunnelStats, DateRangeType } from "@/hooks/useLeadFunnelStats";
import { useUnit } from "@/contexts/UnitContext";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export function LeadFunnelChart() {
  console.log('Renderizando LeadFunnelChart');
  
  const { selectedUnitId } = useUnit();
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  const handleDateRangeChange = (type: DateRangeType, range?: DateRange) => {
    console.log('Alterando range de data:', { type, range });
    setDateRange(type);
    if (type === 'custom' && range) {
      setCustomRange(range);
    }
  };
  
  const { data: funnelStats, isLoading } = useLeadFunnelStats(
    selectedUnitId,
    dateRange,
    customRange?.from,
    customRange?.to
  );
  
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!funnelStats) return [];
    
    return [
      {
        name: 'Leads',
        valor: funnelStats.totalLeads,
        taxa: 100, // 100%
        legenda: 'Leads Recebidos'
      },
      {
        name: 'Contatos',
        valor: funnelStats.effectiveContacts,
        taxa: funnelStats.effectiveContactRate,
        legenda: 'Contatos Efetivos'
      },
      {
        name: 'Agendamentos',
        valor: funnelStats.scheduledVisits,
        taxa: funnelStats.scheduledVisitsRate,
        legenda: 'Agendamentos'
      },
      {
        name: 'Atendimentos',
        valor: funnelStats.completedVisits,
        taxa: funnelStats.completedVisitsRate,
        legenda: 'Atendimentos'
      },
      {
        name: 'Matrículas',
        valor: funnelStats.enrollments,
        taxa: funnelStats.enrollmentsRate,
        legenda: 'Matrículas'
      }
    ];
  };
  
  const chartData = prepareChartData();
  
  // Configurações visuais do gráfico
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
            Carregando dados do funil...
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
            Nenhuma unidade selecionada
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Formatador de números para o gráfico
  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };
  
  // Formatador de percentuais para o gráfico
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Funil de Conversão de Leads</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Mostra a conversão de leads por etapa (cada lead contado apenas uma vez em cada etapa)
          </p>
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
                barSize={40}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis type="category" dataKey="legenda" width={120} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === 'valor' ? 'Quantidade' : 'Taxa de Conversão'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="valor" 
                  name="Quantidade" 
                  radius={[0, 4, 4, 0]} 
                  fill="var(--color-lead)"
                >
                  <LabelList dataKey="valor" position="right" formatter={formatNumber} />
                </Bar>
                <ReferenceLine x={0} stroke="#000" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="text-center">
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
