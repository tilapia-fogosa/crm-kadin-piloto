
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeadSourceForm } from "./LeadSourceForm";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

interface LeadSourceActionsProps {
  source: LeadSource;
  onDelete: (source: LeadSource) => Promise<void>;
}

export function LeadSourceActions({ source, onDelete }: LeadSourceActionsProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  // Função para log detalhado das ações
  const logAction = (action: string, sourceId: string) => {
    console.log(`Ação ${action} na origem ${sourceId} (is_system: ${source.is_system})`);
  };

  return (
    <div className="space-x-2 flex items-center">
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={source.is_system}
            onClick={() => logAction('editar', source.id)}
          >
            {source.is_system ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Origens do sistema não podem ser editadas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Origem</DialogTitle>
          </DialogHeader>
          <LeadSourceForm 
            initialData={source} 
            onClose={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            disabled={source.is_system}
            onClick={() => logAction('excluir', source.id)}
          >
            {source.is_system ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Origens do sistema não podem ser removidas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a origem <strong>"{source.name}"</strong>? Esta ação não pode ser desfeita.
              <p className="mt-2 text-destructive">
                Atenção: Leads existentes que usam esta origem não serão afetados, mas novos leads 
                com esta origem podem ser classificados incorretamente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(source)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
