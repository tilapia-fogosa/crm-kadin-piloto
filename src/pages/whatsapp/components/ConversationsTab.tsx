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
import { useWhatsappConnectionStatus } from "../hooks/useWhatsappConnectionStatus";
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
  const { data: whatsappStatus } = useWhatsappConnectionStatus();
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
      <div className="w-full h-full relative overflow-hidden border border-border bg-background rounded-md md:rounded-lg">
        {/* Alerta de WhatsApp desconectado - Z-Index alto */}
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <WhatsappDisconnectedAlert isDisconnected={whatsappStatus?.isDisconnected || false} />
          </div>
        </div>

        {/* Lista de conversas - Fixa na esquerda (400px) */}
        <div className="absolute top-0 left-0 bottom-0 w-[400px] border-r border-border bg-card overflow-hidden z-10">
          <ConversationList
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            onActivityClick={handleActivityClick}
            onToggleTipoAtendimento={handleToggleTipoAtendimento}
          />
        </div>

        {/* Área do chat - Ancorada à esquerda (400px) e direita (0) */}
        <div className="absolute top-0 bottom-0 right-0 left-[400px] flex flex-col bg-background overflow-hidden z-0">
          <ChatArea
            selectedClientId={selectedClientId}
            conversations={conversations}
          />
        </div>
      </div>

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
