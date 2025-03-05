
import { UnitSelector } from "@/components/UnitSelector";
import { useUnit } from "@/contexts/UnitContext";
import { useCommercialStats } from "@/hooks/useCommercialStats";
import { CommercialStatsTable } from "@/components/commercial/CommercialStatsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommercialManagement() {
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit();
  const { unitStats, userStats, sourceStats, isLoading } = useCommercialStats();

  if (isLoading || isLoadingUnit) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }

  if (!selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Selecione uma unidade para ver as estatísticas comerciais</p>
        <UnitSelector />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestão Comercial</h2>
        <UnitSelector />
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Por Unidade</TabsTrigger>
          <TabsTrigger value="users">Por Usuário</TabsTrigger>
          <TabsTrigger value="sources">Por Origem</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <CommercialStatsTable 
            data={unitStats} 
            nameKey="unit_name"
            title="Estatísticas por Unidade" 
          />
        </TabsContent>

        <TabsContent value="users">
          <CommercialStatsTable 
            data={userStats} 
            nameKey="user_name"
            title="Estatísticas por Usuário" 
          />
        </TabsContent>

        <TabsContent value="sources">
          <CommercialStatsTable 
            data={sourceStats} 
            nameKey="source_name"
            title="Estatísticas por Origem" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
