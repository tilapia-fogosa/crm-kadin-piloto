
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLeadFunnelConversion } from '@/hooks/useLeadFunnelConversion';
import Plotly from 'plotly.js-dist-min';
import { DateRangePicker } from "./DateRangePicker";
import { DateRangeType } from "@/hooks/useLeadFunnelStats";

interface LeadConversionFunnelProps {
  unitId: string | null;
}

export function LeadConversionFunnel({ unitId }: LeadConversionFunnelProps) {
  const [dateRange, setDateRange] = React.useState<DateRangeType>('current-month');
  const [customRange, setCustomRange] = React.useState<{from?: Date; to?: Date;}>({
    from: undefined,
    to: undefined
  });

  const { data: funnelData, isLoading, error } = useLeadFunnelConversion(
    unitId,
    dateRange,
    customRange.from,
    customRange.to
  );

  useEffect(() => {
    if (!funnelData || !document.getElementById('funnelPlot')) return;

    const labels = [
      'Leads Recebidos',
      'Contatos Efetivos',
      'Agendamentos',
      'Atendimentos',
      'Matrículas'
    ];

    const values = [
      funnelData.leads,
      funnelData.contatos_efetivos,
      funnelData.agendamentos,
      funnelData.atendimentos,
      funnelData.matriculas
    ];

    // Calcular porcentagens de conversão
    const percentages = values.map((value, index) => {
      if (index === 0) return '100%';
      const previousValue = values[index - 1];
      if (!previousValue) return '0%';
      return `${((value / previousValue) * 100).toFixed(1)}%`;
    });

    // Configurar dados do funil
    const data = [{
      type: 'funnel',
      y: labels,
      x: values,
      textposition: "inside",
      textinfo: "value+percent previous",
      opacity: 0.65,
      marker: {
        color: [
          "#ff7043",
          "#ff8a65",
          "#ffab91",
          "#ffccbc",
          "#ffe0d6"
        ]
      },
      connector: {
        line: {
          color: "rgb(200, 200, 200)",
          width: 1
        }
      },
      textfont: {
        family: "sans-serif",
        size: 14,
        color: "black"
      },
      hoverinfo: "text",
      text: labels.map((label, i) => 
        `${label}<br>Total: ${values[i]}<br>Conversão: ${percentages[i]}`
      )
    }];

    // Layout do gráfico
    const layout = {
      margin: { l: 150, r: 0, b: 0, t: 0, pad: 0 },
      width: document.getElementById('funnelPlot')!.offsetWidth,
      height: 400,
      funnelmode: "stack",
      showlegend: false,
      font: { family: "sans-serif", size: 12 }
    };

    Plotly.newPlot('funnelPlot', data, layout, { responsive: true });

    // Cleanup
    return () => {
      if (document.getElementById('funnelPlot')) {
        Plotly.purge('funnelPlot');
      }
    };
  }, [funnelData]);

  const handleDateRangeChange = (type: DateRangeType, range?: { from: Date; to: Date }) => {
    setDateRange(type);
    if (type === 'custom' && range) {
      setCustomRange(range);
    }
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
          <div className="h-[400px] flex items-center justify-center">
            <Skeleton className="h-[350px] w-full" />
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
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">
              {!unitId ? "Selecione uma unidade" : "Nenhum dado disponível para o período"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div id="funnelPlot" className="w-full" />
      </CardContent>
    </Card>
  );
}
