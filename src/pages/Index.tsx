
import React from 'react';
import { RecentContractPhotos } from '@/components/dashboard/RecentContractPhotos';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { StatsCard } from '@/components/dashboard/StatsCard';

function Index() {
  console.log("Rendering Dashboard/Index page");
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard />
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <LeadsChart />
        <RecentContractPhotos />
      </div>
    </div>
  );
}

export default Index;
