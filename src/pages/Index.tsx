
import React from 'react';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentClientsList } from '@/components/dashboard/RecentClientsList';
import { Users } from 'lucide-react';
import { useLeadsStats } from '@/hooks/useLeadsStats';
import { useUnit } from '@/contexts/UnitContext';
import { UnitSelector } from '@/components/UnitSelector';

function Index() {
  console.log("Rendering Dashboard/Index page");
  
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit();
  const { data: leadsStats } = useLeadsStats(selectedUnitId);
  
  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UnitSelector />
      </div>
      
      {isLoadingUnit ? (
        <div>Carregando...</div>
      ) : !selectedUnitId ? (
        <div>Selecione uma unidade para ver os dados</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total de Leads"
              value={leadsStats?.oneMonth?.total || "0"}
              icon={Users}
              comparison={leadsStats?.oneMonth?.comparison}
              description="Leads no mês atual"
            />
            <StatsCard 
              title="Leads Últimos 3 Meses"
              value={leadsStats?.threeMonths?.total || "0"}
              icon={Users}
              comparison={leadsStats?.threeMonths?.comparison}
              description="Comparado ao ano anterior"
            />
            <StatsCard 
              title="Leads Últimos 6 Meses"
              value={leadsStats?.sixMonths?.total || "0"}
              icon={Users}
              comparison={leadsStats?.sixMonths?.comparison}
              description="Comparado ao ano anterior"
            />
            <StatsCard 
              title="Leads Últimos 12 Meses"
              value={leadsStats?.twelveMonths?.total || "0"}
              icon={Users}
              comparison={leadsStats?.twelveMonths?.comparison}
              description="Comparado ao ano anterior"
            />
          </div>
          
          <div className="grid flex-1 gap-6 md:grid-cols-2">
            <LeadsChart />
            <RecentClientsList />
          </div>
        </>
      )}
    </div>
  );
}

export default Index;
