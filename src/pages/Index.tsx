
import { RegionsTable } from "@/components/regions/regions-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { BarChart4 } from "lucide-react";

export default function Index() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Gerencie seus leads e acompanhe o desempenho da sua unidade.
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="regions">Regiões</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              title="Total de Leads"
              value="120"
              icon={BarChart4}
              description="Total de leads ativos"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <LeadsChart />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="regions">
          <RegionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
