
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitForm } from "./unit-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnitEditDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitEditDialog({ unit, open, onOpenChange }: UnitEditDialogProps) {
  const { toast } = useToast();

  const { data: unitData, isLoading, error } = useQuery({
    queryKey: ['units', unit?.id],
    queryFn: async () => {
      if (!unit) return null;
      
      console.log('Buscando dados da unidade:', unit.id);
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unit.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar unidade:', error);
        throw error;
      }

      console.log('Dados recuperados:', data);
      return data;
    },
    enabled: !!unit,
  });

  if (!unit) return null;

  if (error) {
    console.error('Erro na query:', error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar dados",
      description: "Houve um erro ao carregar os dados da unidade.",
    });
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>

        {unitData && (
          <div className="mt-6">
            <UnitForm
              initialData={unitData}
              isEditing
              onSuccess={() => {
                toast({
                  title: "Unidade atualizada",
                  description: "A unidade foi atualizada com sucesso.",
                });
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
