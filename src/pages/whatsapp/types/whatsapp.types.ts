/**
 * Tipos para a funcionalidade de WhatsApp
 * 
 * Log: Definição dos tipos TypeScript para conversas e mensagens
 * - Conversation: representa um cliente com mensagens (lista lateral)
 * - Message: representa uma mensagem individual do histórico comercial
 * - WhatsAppConfig: configuração do status de ativação
 */

// Conversa na lista (JOIN clients + historico_comercial)
export interface Conversation {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  primeiroNome: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFromMe: boolean;
  totalMessages: number;
  unitId: string;
}

// Mensagem individual
export interface Message {
  id: number;
  clientId: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
  createdByName?: string | null;
}

// Configuração
export interface WhatsAppConfig {
  isActive: boolean;
}
