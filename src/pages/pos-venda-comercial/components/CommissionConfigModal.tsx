import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CommissionConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string | null;
}

export function CommissionConfigModal({ 
  open, 
  onOpenChange, 
  unitId 
}: CommissionConfigModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Fórmula de Comissão</DialogTitle>
          <DialogDescription>
            Defina a fórmula de cálculo para as comissões desta unidade
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-center">
            🚧 Interface de configuração em desenvolvimento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
