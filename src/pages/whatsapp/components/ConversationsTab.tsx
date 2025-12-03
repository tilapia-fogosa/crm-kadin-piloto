/**
 * Aba de conversas (container principal)
 * 
 * Log: Componente principal da aba de conversas
 * Etapas:
 * 1. Gerencia estado da conversa selecionada
 * 2. Gerencia estado do modal de atividades
 * 3. Busca lista de conversas
 * 4. Renderiza layout de 2 colunas (lista + chat)
 * 5. Responsivo: em mobile, mostra apenas lista ou chat
 * 6. Integra modal de atividades do Kanban
 * 
 * Utiliza cores do sistema: background, card
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";
import { useConversations } from "../hooks/useConversations";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useToggleTipoAtendimento } from "../hooks/useToggleTipoAtendimento";
import { useMessagesRealtime } from "../hooks/useMessagesRealtime";
import { useWhatsappStatus } from "../hooks/useWhatsappStatus";
import { WhatsappDisconnectedAlert } from "./WhatsappDisconnectedAlert";
import { CardSheet } from "@/components/kanban/components/sheet/CardSheet";
import { useActivityOperations } from "@/components/kanban/hooks/useActivityOperations";
import { useWhatsApp } from "@/components/kanban/hooks/useWhatsApp";
import { KanbanCard } from "@/components/kanban/types";
import { Conversation } from "../types/whatsapp.types";
import { useQueryClient } from "@tanstack/react-query";

// Adaptador para transformar Conversation em KanbanCard
// Log: Mapeia todos os campos da conversa para exibição no CardSheet
function conversationToKanbanCard(conversation: Conversation): KanbanCard {
  return {
    id: conversation.clientId,
    clientName: conversation.clientName,
    phoneNumber: conversation.phoneNumber,
    email: conversation.email || "",
    leadSource: conversation.leadSource || "WhatsApp",
    createdAt: new Date().toISOString(),
    nextContactDate: null,
    scheduledDate: null,
    valorizationConfirmed: false,
    activities: [], // Será carregado pelo CardSheet
    labels: [],
    registrationName: conversation.registrationName || null,
    lastUpdated: new Date().toISOString(),
    unitId: conversation.unitId,
    unitName: conversation.unitName,
    original_ad: conversation.original_ad,
    original_adset: conversation.original_adset,
    observations: conversation.observations,
    quantidadeCadastros: conversation.quantidadeCadastros,
    historicoCadastros: conversation.historicoCadastros
  };
}

export function ConversationsTab() {
  console.log('ConversationsTab: Renderizando aba de conversas');

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [lastMarkedClientId, setLastMarkedClientId] = useState<string | null>(null);
  const [activityModalClientId, setActivityModalClientId] = useState<string | null>(null);
  const { data: conversations = [] } = useConversations();
  const { data: whatsappStatus } = useWhatsappStatus();
  const markAsRead = useMarkAsRead();
  const queryClient = useQueryClient();

  // Ativar realtime subscription para mensagens WhatsApp
  useMessagesRealtime();

  // Hooks para operações de atividades e tipo de atendimento
  const { registerAttempt, registerEffectiveContact, registerScheduling, submitAttendance } = useActivityOperations();
  const { handleWhatsAppClick } = useWhatsApp();
  const toggleTipoAtendimento = useToggleTipoAtendimento();

  // Marcar mensagens como lidas quando selecionar uma conversa (apenas para cadastrados)
  useEffect(() => {
    console.log('ConversationsTab: useEffect executado, selectedClientId:', selectedClientId, 'lastMarkedClientId:', lastMarkedClientId);
    
    // Não marcar como lida se for número não cadastrado
    const isUnregistered = selectedClientId?.startsWith('phone_');
    
    if (selectedClientId && selectedClientId !== lastMarkedClientId && !isUnregistered) {
      console.log('ConversationsTab: Marcando como lida (nova conversa):', selectedClientId);
      markAsRead.mutate(selectedClientId);
      setLastMarkedClientId(selectedClientId);
    }
  }, [selectedClientId, lastMarkedClientId]);

  // Encontrar a conversa para o modal de atividades
  const activityModalConversation = conversations.find(c => c.clientId === activityModalClientId);
  const activityModalCard = activityModalConversation
    ? conversationToKanbanCard(activityModalConversation)
    : null;

  const handleActivityClick = (clientId: string) => {
    console.log('ConversationsTab: Abrindo modal de atividades para cliente:', clientId);
    setActivityModalClientId(clientId);
  };

  const handleDeleteActivity = async (activityId: string, clientId: string) => {
    console.log('ConversationsTab: Deletar atividade não implementado ainda');
    // TODO: Implementar se necessário
  };

  const handleToggleTipoAtendimento = (clientId: string, currentTipo: 'bot' | 'humano') => {
    console.log('ConversationsTab: Alternando tipo de atendimento', { clientId, currentTipo });
    const newTipo = currentTipo === 'bot' ? 'humano' : 'bot';
    toggleTipoAtendimento.mutate({ clientId, newTipo });
  };

  const handleSelectClient = (clientId: string, isUnregistered: boolean = false) => {
    console.log('ConversationsTab: Selecionando cliente:', clientId, 'não cadastrado:', isUnregistered);
    
    // Permite visualização de mensagens não cadastradas
    if (isUnregistered) {
      console.log('ConversationsTab: Permitindo visualização de mensagens não cadastradas');
    }
    
    // Invalida cache de mensagens do cliente selecionado para garantir dados mais recentes
    queryClient.invalidateQueries({ 
      queryKey: ['whatsapp-messages', clientId] 
    });
    
    setSelectedClientId(clientId);
  };

  return (
    <>
      <Card className="h-full overflow-hidden border-0 shadow-none md:border relative">
        {/* Alerta de WhatsApp desconectado */}
        <WhatsappDisconnectedAlert isDisconnected={whatsappStatus?.isDisconnected || false} />
        
        <div className="flex h-full">
          {/* Lista de conversas (esconde em mobile quando há conversa selecionada) */}
          <div className={selectedClientId ? "hidden md:block h-full md:w-[350px] md:flex-shrink-0" : "w-full md:w-[350px] md:flex-shrink-0 h-full"}>
            <ConversationList
              selectedClientId={selectedClientId}
              onSelectClient={handleSelectClient}
              onActivityClick={handleActivityClick}
              onToggleTipoAtendimento={handleToggleTipoAtendimento}
            />
          </div>

          {/* Área do chat (esconde em mobile quando não há conversa selecionada) */}
          <div className={!selectedClientId ? "hidden md:flex md:flex-1 h-full" : "w-full md:flex-1 h-full"}>
            <ChatArea
              selectedClientId={selectedClientId}
              conversations={conversations}
            />
          </div>
        </div>
      </Card>

      {/* Modal de Atividades - Renderizado fora do Card para evitar problemas de z-index */}
      {activityModalCard && (
        <CardSheet
          card={activityModalCard}
          isOpen={!!activityModalClientId}
          onOpenChange={(open) => {
            if (!open) {
              setActivityModalClientId(null);
            }
          }}
          onWhatsAppClick={(e) => handleWhatsAppClick(e, activityModalCard.phoneNumber)}
          onDeleteActivity={handleDeleteActivity}
          onRegisterAttempt={registerAttempt}
          onRegisterEffectiveContact={registerEffectiveContact}
          onRegisterScheduling={registerScheduling}
          onRegisterAttendance={async (attendance) => {
            await submitAttendance(attendance);
          }}
        />
      )}
    </>
  );
}
