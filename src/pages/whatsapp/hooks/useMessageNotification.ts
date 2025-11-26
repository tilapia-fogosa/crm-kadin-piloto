/**
 * Hook para notificação sonora de novas mensagens
 * 
 * Log: Hook que detecta novas mensagens e toca som de notificação
 * Etapas:
 * 1. Recebe lista de conversas atual
 * 2. Compara com conversas anteriores usando useRef
 * 3. Detecta se há novas mensagens não lidas
 * 4. Toca som de notificação quando detecta nova mensagem
 * 5. Atualiza referência das conversas anteriores
 */

import { useEffect, useRef } from 'react';

interface Conversation {
  clientId: string;
  unreadCount: number;
  lastMessageTime: Date | string;
}

export function useMessageNotification(conversations: Conversation[]) {
  const previousConversationsRef = useRef<Conversation[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar áudio
  useEffect(() => {
    console.log('useMessageNotification: Inicializando áudio de notificação');
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5; // Volume médio
    
    return () => {
      console.log('useMessageNotification: Limpando áudio de notificação');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Não processar na primeira renderização
    if (previousConversationsRef.current.length === 0) {
      console.log('useMessageNotification: Primeira renderização, armazenando conversas iniciais');
      previousConversationsRef.current = conversations;
      return;
    }

    console.log('useMessageNotification: Verificando novas mensagens', {
      conversasAtuais: conversations.length,
      conversasAnteriores: previousConversationsRef.current.length
    });

    // Verificar se há novas mensagens não lidas
    let hasNewMessages = false;

    for (const currentConv of conversations) {
      const previousConv = previousConversationsRef.current.find(
        (c) => c.clientId === currentConv.clientId
      );

      // Se é uma conversa nova ou tem mais mensagens não lidas
      if (!previousConv || currentConv.unreadCount > previousConv.unreadCount) {
        console.log('useMessageNotification: Nova mensagem detectada!', {
          clientId: currentConv.clientId,
          unreadCountAnterior: previousConv?.unreadCount || 0,
          unreadCountAtual: currentConv.unreadCount
        });
        hasNewMessages = true;
        break;
      }

      // Verificar se a última mensagem mudou (nova mensagem mesmo que já tenha sido lida)
      if (
        previousConv &&
        new Date(currentConv.lastMessageTime).getTime() > 
        new Date(previousConv.lastMessageTime).getTime()
      ) {
        console.log('useMessageNotification: Nova mensagem detectada por timestamp!', {
          clientId: currentConv.clientId,
          timestampAnterior: previousConv.lastMessageTime,
          timestampAtual: currentConv.lastMessageTime
        });
        hasNewMessages = true;
        break;
      }
    }

    // Tocar som se houver novas mensagens
    if (hasNewMessages && audioRef.current) {
      console.log('useMessageNotification: Tocando som de notificação');
      audioRef.current.currentTime = 0; // Resetar para o início
      audioRef.current.play().catch((error) => {
        console.error('useMessageNotification: Erro ao tocar som:', error);
      });
    }

    // Atualizar referência
    previousConversationsRef.current = conversations;
  }, [conversations]);
}
