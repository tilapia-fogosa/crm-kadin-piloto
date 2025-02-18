
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitForm } from "./unit-form";
import { useToast } from "@/hooks/use-toast";

interface UnitEditDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitEditDialog({ unit, open, onOpenChange }: UnitEditDialogProps) {
  const { toast } = useToast();

  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <UnitForm
            initialData={unit}
            isEditing={true}
            onSuccess={() => {
              onOpenChange(false);
              toast({
                title: "Unidade atualizada",
                description: "A unidade foi atualizada com sucesso.",
              });
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
