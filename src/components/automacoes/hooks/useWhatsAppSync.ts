import { useState } from "react";

// Log: Hook para gerenciar estado de sincronização do WhatsApp
export function useWhatsAppSync() {
  console.log('useWhatsAppSync: Inicializando hook de sincronização');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const openModal = () => {
    console.log('useWhatsAppSync: Abrindo modal de sincronização');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('useWhatsAppSync: Fechando modal de sincronização');
    setIsModalOpen(false);
  };

  const connect = () => {
    console.log('useWhatsAppSync: Conectando WhatsApp');
    setIsConnected(true);
  };

  const disconnect = () => {
    console.log('useWhatsAppSync: Desconectando WhatsApp');
    setIsConnected(false);
  };

  return {
    isModalOpen,
    isConnected,
    openModal,
    closeModal,
    connect,
    disconnect,
  };
}