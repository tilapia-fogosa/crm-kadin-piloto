
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActivityFunnelPeriod } from '@/hooks/useActivityFunnelStats';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ActivityFunnelCardProps {
  title: string;
  period: ActivityFunnelPeriod | undefined;
  description?: string;
  className?: string;
}

export function ActivityFunnelCard({ 
  title, 
  period, 
  description,
  className 
}: ActivityFunnelCardProps) {
  console.log('Renderizando ActivityFunnelCard:', { title, period });
  
  if (!period) {
    return (
      <Card className={cn("col-span-1 md:col-span-2", className)}>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  // Função para formatar números
  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  // Função para formatar percentuais
  const formatPercent = (num: number) => {
    return num.toFixed(1) + '%';
  };

  // Função para determinar se houve aumento ou diminuição
  const getComparisonElement = (current: number, previous: number) => {
    const diff = current - previous;
    const isIncrease = diff > 0;
    
    return (
      <span className={cn(
        "ml-2 flex items-center text-xs font-medium",
        isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-yellow-600"
      )}>
        {isIncrease ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
        {isIncrease ? "+" : ""}{diff.toFixed(1)}%
      </span>
    );
  };

  // Função para mostrar a diferença numérica entre períodos
  const getNumericComparisonElement = (current: number, previous: number) => {
    const diff = current - previous;
    const isIncrease = diff > 0;
    
    return (
      <span className={cn(
        "ml-2 flex items-center text-xs font-medium",
        isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-yellow-600"
      )}>
        {isIncrease ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
        {isIncrease ? "+" : ""}{formatNumber(diff)}
      </span>
    );
  };

  // Dados para as linhas do funil
  const funnelRows = [
    {
      label: "Total de Contatos",
      value: formatNumber(period.totalContacts),
      numericComparison: getNumericComparisonElement(period.totalContacts, period.comparison.totalContacts),
      percent: null, // Não tem percentual
      comparison: period.comparison.totalContacts,
      hasDivider: true,
    },
    {
      label: "Contatos Efetivos",
      value: formatNumber(period.effectiveContacts),
      numericComparison: getNumericComparisonElement(period.effectiveContacts, period.comparison.effectiveContacts),
      percent: formatPercent(period.effectiveContactsRate),
      previousPercent: period.comparison.effectiveContactsRate,
      hasDivider: true,
    },
    {
      label: "Agendamentos",
      value: formatNumber(period.scheduledVisits),
      numericComparison: getNumericComparisonElement(period.scheduledVisits, period.comparison.scheduledVisits),
      percent: formatPercent(period.scheduledVisitsRate),
      previousPercent: period.comparison.scheduledVisitsRate,
      hasDivider: true,
    },
    {
      label: "Atendimentos",
      value: formatNumber(period.completedVisits),
      numericComparison: getNumericComparisonElement(period.completedVisits, period.comparison.completedVisits),
      percent: formatPercent(period.completedVisitsRate),
      previousPercent: period.comparison.completedVisitsRate,
      hasDivider: true,
    },
    {
      label: "Matrículas",
      value: formatNumber(period.enrollments),
      numericComparison: getNumericComparisonElement(period.enrollments, period.comparison.enrollments),
      percent: formatPercent(period.enrollmentsRate),
      previousPercent: period.comparison.enrollmentsRate,
      hasDivider: false,
    }
  ];

  return (
    <Card className={cn("col-span-1 md:col-span-2", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {funnelRows.map((row, index) => (
            <React.Fragment key={index}>
              <div className={cn(
                "grid grid-cols-8 py-2 text-sm",
                index % 2 === 0 ? "bg-muted/30" : ""
              )}>
                <div className="col-span-3 font-medium">{row.label}</div>
                <div className="col-span-2 text-center flex items-center justify-center">
                  {row.value}
                  {row.numericComparison}
                </div>
                <div className="col-span-3 flex items-center justify-end">
                  {row.percent && (
                    <>
                      <span className="flex items-center">
                        <Percent className="mr-1 h-3 w-3" />
                        {row.percent}
                      </span>
                      {row.previousPercent !== undefined && 
                        getComparisonElement(row.percent ? parseFloat(row.percent) : 0, row.previousPercent)}
                    </>
                  )}
                </div>
              </div>
              {row.hasDivider && <Separator className="my-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
