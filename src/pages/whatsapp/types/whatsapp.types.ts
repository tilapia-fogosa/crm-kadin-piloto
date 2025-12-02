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
  clientId: string; // UUID do cliente ou "phone_NUMERO" para não cadastrados
  clientName: string;
  phoneNumber: string;
  primeiroNome: string;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFromMe: boolean;
  totalMessages: number;
  unitId: string;
  tipoAtendimento: 'bot' | 'humano';
  unreadCount: number; // Quantidade de mensagens não lidas pela equipe
  isNewLead: boolean; // Indica se o cliente tem apenas a mensagem automática do Sistema-Kadin
  isUnregistered: boolean; // Indica se é um número não cadastrado no sistema
  quantidadeCadastros?: number; // Contador de cadastros duplicados
}

// Mensagem individual
export interface Message {
  id: number;
  clientId: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
  createdByName?: string | null;
  tipoMensagem?: string | null;
}

// Configuração
export interface WhatsAppConfig {
  isActive: boolean;
}

// Mensagem automática
export interface AutoMessage {
  id: string;
  profileId: string;
  nome: string;
  mensagem: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}
