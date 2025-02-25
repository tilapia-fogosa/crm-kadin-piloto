
import { UnitsTable } from "@/components/units/units-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Unit } from "@/types/unit";
import { useToast } from "@/hooks/use-toast";

export default function UnitsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: units, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          region:regions(name)
        `)
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (unit: Unit) => {
    navigate(`/regions/units/${unit.id}/edit`);
  };

  const handleDelete = async (unit: Unit) => {
    try {
      const { error } = await supabase
        .from('units')
        .update({ active: false })
        .eq('id', unit.id);

      if (error) throw error;

      toast({
        title: "Unidade removida",
        description: "A unidade foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover a unidade.",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todas Unidades</h1>
        <Button onClick={() => navigate("/regions/units/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <UnitsTable 
        units={units || []} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
