/**
 * LOG: Modal completo para dados comerciais pós-venda
 * Integra formulário robusto com backend via funções específicas
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, X } from "lucide-react";
import { useCommercialData } from "../hooks/useCommercialData";
import { CommercialDataForm } from "./forms/CommercialDataForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DadosComercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

export function DadosComercialModal({ isOpen, onClose, activityId }: DadosComercialModalProps) {
  console.log('LOG: Renderizando DadosComercialModal para atividade:', activityId);

  // LOG: Hook simplificado para gerenciar dados comerciais (sem dependência de unitId)
  const {
    commercialData,
    isLoading: isLoadingCommercial,
    saveCommercialData,
    isSaving
  } = useCommercialData(activityId);

  console.log('LOG: Status de carregamento dos dados comerciais:', isLoadingCommercial);

  /**
   * LOG: Handler para salvamento dos dados comerciais
   * Integra com hook que gerencia backend
   */
  const handleSave = (data: any) => {
    console.log('LOG: Salvando dados comerciais via modal:', data);
    saveCommercialData(data);
  };

  /**
   * LOG: Handler para fechamento do modal
   * Limpa estado e fecha modal
   */
  const handleClose = () => {
    console.log('LOG: Fechando modal de dados comerciais');
    onClose();
  };

  const isLoading = isLoadingCommercial;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <DialogTitle>Dados Comerciais</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Carregando dados comerciais...</p>
                </div>
              </div>
            ) : (
              <CommercialDataForm
                initialData={commercialData}
                onSubmit={handleSave}
                isLoading={isSaving}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}