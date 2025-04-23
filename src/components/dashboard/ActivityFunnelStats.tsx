
import { useDashboardActivityStats } from '@/hooks/useDashboardActivityStats';
import { ActivityFunnelCard } from './ActivityFunnelCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ActivityFunnelStatsProps {
  unitId: string | null;
}

export function ActivityFunnelStats({ unitId }: ActivityFunnelStatsProps) {
  console.log('Renderizando ActivityFunnelStats para unidade:', unitId);
  
  const { data: funnelStats, isLoading, error } = useDashboardActivityStats(unitId);
  
  if (isLoading) {
    return <div className="p-4 text-center">Carregando estatísticas de conversão...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar as estatísticas de conversão. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!funnelStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <ActivityFunnelCard 
          title="Atividades do Mês"
          period={funnelStats.oneMonth}
          description="Comparado ao mesmo período do ano anterior"
        />
        
        <ActivityFunnelCard 
          title="Atividades dos Últimos 3 Meses"
          period={funnelStats.threeMonths}
          description="Comparado ao mesmo período do ano anterior"
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <ActivityFunnelCard 
          title="Atividades dos Últimos 6 Meses"
          period={funnelStats.sixMonths}
          description="Comparado ao mesmo período do ano anterior"
        />
        
        <ActivityFunnelCard 
          title="Atividades dos Últimos 12 Meses"
          period={funnelStats.twelveMonths}
          description="Comparado ao mesmo período do ano anterior"
        />
      </div>
    </div>
  );
}
