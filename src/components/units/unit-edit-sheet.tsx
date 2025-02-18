
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UnitForm } from "./unit-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnitEditSheetProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitEditSheet({ unit, open, onOpenChange }: UnitEditSheetProps) {
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Carregando...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  // Prepara os dados iniciais combinando unidade e endereço
  const initialData = unitWithAddress ? {
    ...unitWithAddress,
    ...unitWithAddress.address[0],
  } : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[720px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Unidade</SheetTitle>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
}
