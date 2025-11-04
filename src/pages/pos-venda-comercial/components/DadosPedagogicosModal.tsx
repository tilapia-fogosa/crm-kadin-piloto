/**
 * LOG: Modal completo para dados pedagógicos pós-venda
 * Integra formulário robusto com backend via funções específicas
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap } from "lucide-react";
import { usePedagogicalData } from "../hooks/usePedagogicalData";
import { PedagogicalDataForm } from "./forms/PedagogicalDataForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DadosPedagogicosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

export function DadosPedagogicosModal({ isOpen, onClose, activityId }: DadosPedagogicosModalProps) {
  console.log('LOG: Renderizando DadosPedagogicosModal para atividade:', activityId);

  const handleClose = () => {
    console.log('LOG: Fechando modal de dados pedagógicos');
    onClose();
  };

  // LOG: Buscar dados da atividade (incluindo full_name)
  const { data: activity } = useQuery({
    queryKey: ['activity-data', activityId],
    queryFn: async () => {
      console.log('LOG: Buscando dados da atividade:', activityId);
      const { data, error } = await supabase
        .from('atividade_pos_venda')
        .select('full_name')
        .eq('id', activityId)
        .single();
      
      if (error) {
        console.error('LOG: Erro ao buscar atividade:', error);
        throw error;
      }
      
      console.log('LOG: Atividade encontrada:', data);
      return data;
    },
    enabled: !!activityId,
  });

  const {
    pedagogicalData,
    isLoading: isLoadingPedagogical,
    savePedagogicalData,
    isSaving
  } = usePedagogicalData(activityId, handleClose);

  console.log('LOG: Status de carregamento dos dados pedagógicos:', isLoadingPedagogical);

  const handleSave = (data: any) => {
    console.log('LOG: Salvando dados pedagógicos via modal:', data);
    savePedagogicalData(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <DialogTitle>Dados Pedagógicos</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {isLoadingPedagogical || !activity ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Carregando dados pedagógicos...</p>
                </div>
              </div>
            ) : (
              <PedagogicalDataForm
                activityId={activityId}
                fullName={activity.full_name}
                initialData={pedagogicalData}
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