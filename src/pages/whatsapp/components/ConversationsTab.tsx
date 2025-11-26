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
import { CardSheet } from "@/components/kanban/components/sheet/CardSheet";
import { useActivityOperations } from "@/components/kanban/hooks/useActivityOperations";
import { useWhatsApp } from "@/components/kanban/hooks/useWhatsApp";
import { KanbanCard } from "@/components/kanban/types";
import { Conversation } from "../types/whatsapp.types";

// Adaptador para transformar Conversation em KanbanCard
function conversationToKanbanCard(conversation: Conversation): KanbanCard {
  return {
    id: conversation.clientId,
    clientName: conversation.clientName,
    phoneNumber: conversation.phoneNumber,
    email: "", // Não temos email nas conversas
    leadSource: "WhatsApp", // Fonte padrão
    createdAt: new Date().toISOString(), // Usamos a data atual como fallback
    nextContactDate: null,
    scheduledDate: null,
    valorizationConfirmed: false,
    activities: [], // Será carregado pelo CardSheet
    labels: [],
    registrationName: null,
    lastUpdated: new Date().toISOString(),
    unitId: conversation.unitId
  };
}

export function ConversationsTab() {
  console.log('ConversationsTab: Renderizando aba de conversas');

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activityModalClientId, setActivityModalClientId] = useState<string | null>(null);
  const { data: conversations = [] } = useConversations();
  const markAsRead = useMarkAsRead();

  // Hooks para operações de atividades e tipo de atendimento
  const { registerAttempt, registerEffectiveContact, registerScheduling, submitAttendance } = useActivityOperations();
  const { handleWhatsAppClick } = useWhatsApp();
  const toggleTipoAtendimento = useToggleTipoAtendimento();

  // Marcar mensagens como lidas quando selecionar uma conversa
  useEffect(() => {
    if (selectedClientId) {
      console.log('ConversationsTab: Marcando mensagens como lidas para cliente:', selectedClientId);
      markAsRead.mutate(selectedClientId);
    }
  }, [selectedClientId]);

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

  return (
    <>
      <Card className="h-full overflow-hidden border-0 shadow-none md:border">
        <div className="flex h-full">
          {/* Lista de conversas (esconde em mobile quando há conversa selecionada) */}
          <div className={selectedClientId ? "hidden md:block h-full md:w-[350px] md:flex-shrink-0" : "w-full md:w-[350px] md:flex-shrink-0 h-full"}>
            <ConversationList
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
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
