
import { useActivityFunnelStats } from '@/hooks/useActivityFunnelStats';
import { ActivityFunnelCard } from './ActivityFunnelCard';

interface ActivityFunnelStatsProps {
  unitId: string | null;
}

export function ActivityFunnelStats({ unitId }: ActivityFunnelStatsProps) {
  console.log('Renderizando ActivityFunnelStats para unidade:', unitId);
  
  const { data: funnelStats, isLoading } = useActivityFunnelStats(unitId);
  
  if (isLoading) {
    return <div>Carregando estatísticas de conversão...</div>;
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
