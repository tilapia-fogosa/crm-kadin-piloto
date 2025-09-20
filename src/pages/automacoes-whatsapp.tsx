import { RotaProtegidaPorFuncionalidade } from "@/components/features/RotaProtegidaPorFuncionalidade";
import { ProtecaoFuncionalidade } from "@/components/features/ProtecaoFuncionalidade";
import { WhatsAppSyncButton } from "@/components/automacoes/WhatsAppSyncButton";
import { WhatsAppSyncModal } from "@/components/automacoes/WhatsAppSyncModal";
import { ActivityAutomationGrid } from "@/components/automacoes/ActivityAutomationGrid";
import { useWhatsAppSync } from "@/components/automacoes/hooks/useWhatsAppSync";

// Log: Página de Automações de WhatsApp - Interface completa
export default function AutomacoesWhatsAppPage() {
  console.log('AutomacoesWhatsAppPage: Renderizando página completa de Automações de WhatsApp');
  
  const { isModalOpen, isConnected, openModal, closeModal } = useWhatsAppSync();

  return (
    <RotaProtegidaPorFuncionalidade funcionalidade="automacao_whatsapp">
      <div className="container py-8 space-y-8">
        {/* Header com botão de sincronização */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Automações de WhatsApp</h1>
            <p className="text-muted-foreground">
              Configure e gerencie suas automações de WhatsApp para otimizar o atendimento aos clientes.
            </p>
          </div>
          
          <ProtecaoFuncionalidade funcionalidade="automacao_whatsapp">
            <WhatsAppSyncButton 
              onClick={openModal}
              isConnected={isConnected}
            />
          </ProtecaoFuncionalidade>
        </div>

        {/* Grid de automações por tipo de atividade */}
        <ProtecaoFuncionalidade funcionalidade="automacao_whatsapp">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Automações por Tipo de Atividade</h2>
              <p className="text-sm text-muted-foreground">
                Configure automações específicas para cada etapa do funil de vendas
              </p>
            </div>
            
            <ActivityAutomationGrid />
          </div>
        </ProtecaoFuncionalidade>

        {/* Modal de sincronização */}
        <WhatsAppSyncModal 
          open={isModalOpen}
          onOpenChange={closeModal}
        />
      </div>
    </RotaProtegidaPorFuncionalidade>
  );
}