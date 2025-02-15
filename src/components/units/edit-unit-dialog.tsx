
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UnitFormFields } from "@/components/units/unit-form-fields";
import { UseFormReturn } from "react-hook-form";
import { UnitFormData } from "@/types/unit-form";

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<UnitFormData>;
  onSubmit: (values: UnitFormData) => Promise<void>;
}

export function EditUnitDialog({ open, onOpenChange, form, onSubmit }: EditUnitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <UnitFormFields form={form} />
            <div className="flex justify-end gap-4">
              <Button type="submit">
                Salvar Alterações
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
