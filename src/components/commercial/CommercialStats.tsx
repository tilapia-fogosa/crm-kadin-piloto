
import { useUnit } from "@/contexts/UnitContext";
import { useCommercialUnitStats } from "@/hooks/useCommercialStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitsTable } from "./tables/UnitsTable";
import { UsersTable } from "./tables/UsersTable";
import { SourcesTable } from "./tables/SourcesTable";

interface CommercialStatsProps {
  selectedMonth: Date;
}

export function CommercialStats({ selectedMonth }: CommercialStatsProps) {
  const { selectedUnitId } = useUnit();

  return (
    <Tabs defaultValue="units" className="w-full">
      <TabsList>
        <TabsTrigger value="units">Por Unidade</TabsTrigger>
        <TabsTrigger value="users">Por Usuário</TabsTrigger>
        <TabsTrigger value="sources">Por Origem</TabsTrigger>
      </TabsList>
      
      <TabsContent value="units">
        <UnitsTable selectedMonth={selectedMonth} />
      </TabsContent>
      
      <TabsContent value="users">
        <UsersTable selectedMonth={selectedMonth} selectedUnitId={selectedUnitId} />
      </TabsContent>
      
      <TabsContent value="sources">
        <SourcesTable selectedMonth={selectedMonth} selectedUnitId={selectedUnitId} />
      </TabsContent>
    </Tabs>
  );
}
