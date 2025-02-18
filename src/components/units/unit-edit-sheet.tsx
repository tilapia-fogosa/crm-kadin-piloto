
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

  const { data: unitData, isLoading } = useQuery({
    queryKey: ['unit', unit?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unit.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!unit && open,
  });

  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Carregando...</div>
        ) : unitData && (
          <div className="mt-6">
            <UnitForm
              initialData={unitData}
              isEditing={true}
              onSuccess={() => {
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
