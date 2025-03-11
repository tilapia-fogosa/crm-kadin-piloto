
import React from 'react';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { RecentClientsList } from '@/components/dashboard/RecentClientsList';
import { useLeadsStats } from '@/hooks/useLeadsStats';
import { useUnit } from '@/contexts/UnitContext';
import { UnitSelector } from '@/components/UnitSelector';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

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
          <DashboardStats leadsStats={leadsStats} />
          
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
