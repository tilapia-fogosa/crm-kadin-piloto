
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnitsTable } from "@/components/units/units-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnitForm } from "@/components/units/unit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Unit } from "@/types/unit";

export default function UnitsPage() {
  const [showNewUnitDialog, setShowNewUnitDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
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
    setSelectedUnit(unit);
    setShowNewUnitDialog(true);
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
        <h1 className="text-2xl font-bold">Unidades</h1>
        <Button onClick={() => setShowNewUnitDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <Dialog open={showNewUnitDialog} onOpenChange={setShowNewUnitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUnit ? "Editar Unidade" : "Nova Unidade"}
            </DialogTitle>
          </DialogHeader>
          <UnitForm
            initialData={selectedUnit}
            isEditing={!!selectedUnit}
            onSuccess={() => {
              setShowNewUnitDialog(false);
              setSelectedUnit(null);
              toast({
                title: selectedUnit ? "Unidade atualizada" : "Unidade criada",
                description: selectedUnit 
                  ? "A unidade foi atualizada com sucesso."
                  : "A unidade foi criada com sucesso.",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <UnitsTable 
        units={units || []} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
