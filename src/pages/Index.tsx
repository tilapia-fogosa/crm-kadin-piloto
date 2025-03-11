
import React from 'react';
import { RecentContractPhotos } from '@/components/dashboard/RecentContractPhotos';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users } from 'lucide-react';

function Index() {
  console.log("Rendering Dashboard/Index page");
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total de Leads"
          value="120"
          icon={Users}
          description="Leads ativos no mês atual"
        />
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <LeadsChart />
        <RecentContractPhotos />
      </div>
    </div>
  );
}

export default Index;
