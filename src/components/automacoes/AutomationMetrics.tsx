interface AutomationMetricsProps {
  created: number;
  active: number;
  dispatches: number;
}

// Log: Componente de métricas das automações
export function AutomationMetrics({ created, active, dispatches }: AutomationMetricsProps) {
  console.log('AutomationMetrics: Renderizando métricas', { created, active, dispatches });

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Automações Criadas:</span>
        <span className="font-medium">{created}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Automações Ativas:</span>
        <span className={`font-medium ${active > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
          {active}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Nº Disparos:</span>
        <span className="font-medium">{dispatches.toLocaleString()}</span>
      </div>
    </div>
  );
}