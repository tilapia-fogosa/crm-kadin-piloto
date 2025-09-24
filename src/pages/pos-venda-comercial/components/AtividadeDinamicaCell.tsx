import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  // LOG: Inicializando célula de atividade dinâmica
  console.log("📋 [AtividadeDinamicaCell] Inicializando célula - Pós-venda:", atividadePosVendaId, "Config:", atividadeConfigId);
  
  const { 
    atividadeRealizada, 
    isLoading, 
    updateAtividade 
  } = useAtividadeRealizada(atividadePosVendaId, atividadeConfigId);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUncheckDialog, setShowUncheckDialog] = useState(false);

  const handleToggle = async (checked: boolean) => {
    // LOG: Iniciando alteração de status
    console.log("📋 [AtividadeDinamicaCell] Alterando status para:", checked);
    
    // Se está desmarcando um item já marcado, mostrar confirmação
    if (!checked && atividadeRealizada?.realizada) {
      console.log("📋 [AtividadeDinamicaCell] Solicitando confirmação para desmarcar");
      setShowUncheckDialog(true);
      return;
    }

    await performToggle(checked);
  };

  const performToggle = async (checked: boolean) => {
    if (isUpdating) {
      console.log("📋 [AtividadeDinamicaCell] Operação já em andamento, ignorando");
      return;
    }

    setIsUpdating(true);
    
    try {
      console.log("📋 [AtividadeDinamicaCell] Executando toggle - Status:", checked);
      await updateAtividade(checked);
      console.log("✅ [AtividadeDinamicaCell] Toggle executado com sucesso");
    } catch (error) {
      console.error("❌ [AtividadeDinamicaCell] Erro ao executar toggle:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmUncheck = async () => {
    console.log("📋 [AtividadeDinamicaCell] Confirmado desmarcação");
    setShowUncheckDialog(false);
    await performToggle(false);
  };

  if (isLoading) {
    console.log("📋 [AtividadeDinamicaCell] Carregando dados da atividade");
    return (
      <div className="flex justify-center">
        <div className="h-5 w-5 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const isRealizada = atividadeRealizada?.realizada || false;
  const dataRealizacao = atividadeRealizada?.data_realizacao;
  const usuarioRealizou = atividadeRealizada?.usuario_realizou;

  console.log("📋 [AtividadeDinamicaCell] Estado atual - Realizada:", isRealizada, "Data:", dataRealizacao, "Usuário:", usuarioRealizou);

  return (
    <>
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

      <AlertDialog open={showUncheckDialog} onOpenChange={setShowUncheckDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar desmarcação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desmarcar esta atividade como não realizada?
              {dataRealizacao && usuarioRealizou && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <p><strong>Concluída em:</strong> {format(new Date(dataRealizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  <p><strong>Por:</strong> {usuarioRealizou}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUncheck}>
              Sim, desmarcar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}