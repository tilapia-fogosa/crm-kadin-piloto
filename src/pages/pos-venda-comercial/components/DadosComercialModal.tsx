import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface DadosComercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

export function DadosComercialModal({ isOpen, onClose, activityId }: DadosComercialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Dados Comerciais
            <Badge variant="outline" className="ml-2">Em Desenvolvimento</Badge>
          </DialogTitle>
          <DialogDescription>
            Formulário para dados comerciais da matrícula está sendo desenvolvido.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Funcionalidade em Desenvolvimento</h3>
            <p className="text-muted-foreground mt-2">
              O formulário de dados comerciais permitirá registrar:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Informações de pagamento</li>
              <li>• Dados do contrato</li>
              <li>• Condições comerciais</li>
              <li>• Histórico de negociação</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}