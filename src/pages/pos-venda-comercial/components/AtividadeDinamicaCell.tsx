import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { CheckCircle2, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAtividadeRealizada } from "../hooks/useAtividadeRealizada";

interface AtividadeDinamicaCellProps {
  atividadePosVendaId: string;
  atividadeConfigId: string;
}

export function AtividadeDinamicaCell({ 
  atividadePosVendaId, 
  atividadeConfigId 
}: AtividadeDinamicaCellProps) {
  const { 
    atividadeRealizada, 
    isLoading, 
    updateAtividade 
  } = useAtividadeRealizada(atividadePosVendaId, atividadeConfigId);
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateAtividade(checked);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="h-5 w-5 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const isRealizada = atividadeRealizada?.realizada || false;
  const dataRealizacao = atividadeRealizada?.data_realizacao;
  const usuarioRealizou = atividadeRealizada?.usuario_realizou;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isRealizada}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
          </div>
        </TooltipTrigger>
        
        {(isRealizada && dataRealizacao) && (
          <TooltipContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-medium">Concluída</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                {format(new Date(dataRealizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              
              {usuarioRealizou && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3" />
                  <span>Por: {usuarioRealizou}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}