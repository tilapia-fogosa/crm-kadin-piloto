import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegionsTable } from "@/components/regions/regions-table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function RegionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (region: any) => {
    setSelectedRegion(region);
  };

  const handleDelete = async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .update({ active: false })
        .eq('id', regionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['regions'] });
      
      toast({
        title: "Região removida",
        description: "A região foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover região:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover a região.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Todas Unidades</TabsTrigger>
          <TabsTrigger value="new">Nova Unidade</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <RegionsTable
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <div className="h-full space-y-4">
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-medium mb-4">Nova Unidade</h2>
                  {/* Implementar formulário de nova unidade */}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
