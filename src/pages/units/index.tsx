
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

export default function UnitsPage() {
  const [showNewUnitDialog, setShowNewUnitDialog] = useState(false);
  const { toast } = useToast();

  const { data: units, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          region:regions(name),
          address:unit_addresses(*)
        `)
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

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
            <DialogTitle>Nova Unidade</DialogTitle>
          </DialogHeader>
          <UnitForm
            onSuccess={() => {
              setShowNewUnitDialog(false);
              toast({
                title: "Unidade criada",
                description: "A unidade foi criada com sucesso.",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <UnitsTable units={units || []} />
    </div>
  );
}
