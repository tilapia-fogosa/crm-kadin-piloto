
import React from 'react';
import { Users } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LeadsStatsData } from '@/hooks/useLeadsStats';

interface DashboardStatsProps {
  leadsStats: LeadsStatsData | undefined;
}

export function DashboardStats({ leadsStats }: DashboardStatsProps) {
  console.log("Rendering DashboardStats component with data:", leadsStats);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total de Leads"
        value={String(leadsStats?.oneMonth?.total || "0")}
        icon={Users}
        comparison={leadsStats?.oneMonth?.comparison}
        description="Leads no mês atual"
      />
      <StatsCard 
        title="Leads Últimos 3 Meses"
        value={String(leadsStats?.threeMonths?.total || "0")}
        icon={Users}
        comparison={leadsStats?.threeMonths?.comparison}
        description="Comparado ao ano anterior"
      />
      <StatsCard 
        title="Leads Últimos 6 Meses"
        value={String(leadsStats?.sixMonths?.total || "0")}
        icon={Users}
        comparison={leadsStats?.sixMonths?.comparison}
        description="Comparado ao ano anterior"
      />
      <StatsCard 
        title="Leads Últimos 12 Meses"
        value={String(leadsStats?.twelveMonths?.total || "0")}
        icon={Users}
        comparison={leadsStats?.twelveMonths?.comparison}
        description="Comparado ao ano anterior"
      />
    </div>
  );
}
