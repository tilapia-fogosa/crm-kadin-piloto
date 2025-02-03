import { GraduationCap, Users, Phone, Target } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import LeadsTable from "@/components/leads/LeadsTable";

const Index = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value="2,350"
          icon={Users}
          description="↗️ 180 novos esta semana"
        />
        <StatsCard
          title="Matrículas"
          value="485"
          icon={GraduationCap}
          description="↗️ 40 novas este mês"
        />
        <StatsCard
          title="Contatos Pendentes"
          value="24"
          icon={Phone}
          description="↘️ 8 desde ontem"
        />
        <StatsCard
          title="Taxa de Conversão"
          value="18.5%"
          icon={Target}
          description="↗️ 2.1% este mês"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <LeadsChart />
        <div className="col-span-4 lg:col-span-3">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Leads Recentes</h2>
          </div>
          <LeadsTable leads={[]} />
        </div>
      </div>
    </div>
  );
};

export default Index;