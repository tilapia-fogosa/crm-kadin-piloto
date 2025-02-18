
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

  const { data: unitWithAddress, isLoading } = useQuery({
    queryKey: ['units', unit?.id],
    queryFn: async () => {
      if (!unit) return null;
      
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          address:unit_addresses(*)
        `)
        .eq('id', unit.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!unit,
  });

  if (!unit) return null;

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

  // Prepara os dados iniciais combinando unidade e endereço
  const initialData = unitWithAddress ? {
    ...unitWithAddress,
    ...unitWithAddress.address[0],
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>

        {initialData && (
          <div className="mt-6">
            <UnitForm
              initialData={initialData}
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
