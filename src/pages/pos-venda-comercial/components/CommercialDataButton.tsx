/**
 * LOG: Botão para dados comerciais com indicador de status
 * Mostra check verde quando todos os campos obrigatórios estão preenchidos
 */

import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle2, Circle } from "lucide-react";
import { useCommercialData } from "../hooks/useCommercialData";

interface CommercialDataButtonProps {
  activityId: string;
  onOpenModal: () => void;
}

export function CommercialDataButton({ activityId, onOpenModal }: CommercialDataButtonProps) {
  console.log('LOG: Renderizando CommercialDataButton para atividade:', activityId);

  // LOG: Hook para verificar status dos dados comerciais
  const { isComplete, isLoadingComplete } = useCommercialData(activityId);

  console.log('LOG: Status dos dados comerciais:', { isComplete, isLoadingComplete });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenModal}
      className="gap-1 px-2 py-1"
      disabled={isLoadingComplete}
    >
      <DollarSign className="h-4 w-4" />
      {isLoadingComplete ? (
        <Circle className="h-4 w-4 animate-pulse" />
      ) : isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
    </Button>
  );
}