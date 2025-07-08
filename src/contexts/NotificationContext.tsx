import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserUnit } from '@/components/kanban/hooks/useUserUnit';

// Log de inicialização
console.log('🔊 [NotificationContext] Contexto carregado');

interface NotificationContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  testSound: () => Promise<void>;
  isAudioSupported: boolean;
  lastNotificationTime: number | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  console.log('🔊 [NotificationProvider] Inicializando provider');
  
  // Estado persistido no localStorage
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const stored = localStorage.getItem('kanban-sound-enabled');
    return stored ? JSON.parse(stored) : true;
  });
  
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const [lastNotificationTime, setLastNotificationTime] = useState<number | null>(null);
  
  // Refs para gestão de áudio e estado
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const realtimeSubscriptionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  
  // Hook para obter unidades do usuário
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  
  // Função para configurar e testar áudio
  const initializeAudio = useCallback(async () => {
    if (!soundEnabled || audioRef.current) return;
    
    try {
      console.log('🔊 [NotificationProvider] Inicializando áudio');
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.preload = 'auto';
      
      // Testar se o áudio pode ser reproduzido
      const canPlay = await new Promise((resolve) => {
        if (!audioRef.current) {
          resolve(false);
          return;
        }
        
        const handleCanPlay = () => {
          audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          resolve(true);
        };
        
        const handleError = () => {
          audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          resolve(false);
        };
        
        audioRef.current.addEventListener('canplaythrough', handleCanPlay);
        audioRef.current.addEventListener('error', handleError);
        
        // Timeout de segurança
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
            audioRef.current.removeEventListener('error', handleError);
          }
          resolve(true); // Assume que funcionará mesmo sem confirmação
        }, 2000);
      });
      
      setIsAudioSupported(canPlay as boolean);
      console.log('🔊 [NotificationProvider] Áudio inicializado:', canPlay ? 'Sucesso' : 'Falha');
      
    } catch (error) {
      console.error('🔊 [NotificationProvider] Erro ao inicializar áudio:', error);
      setIsAudioSupported(false);
    }
  }, [soundEnabled]);
  
  // Função para reproduzir som de notificação
  const playNotificationSound = useCallback(async () => {
    if (!soundEnabled || !audioRef.current || !isAudioSupported) {
      console.log('🔊 [NotificationProvider] Som desabilitado ou áudio não suportado');
      return;
    }
    
    // Debounce: evitar múltiplas notificações em menos de 2 segundos
    const now = Date.now();
    if (lastNotificationTime && (now - lastNotificationTime) < 2000) {
      console.log('🔊 [NotificationProvider] Notificação ignorada (debounce)');
      return;
    }
    
    try {
      console.log('🔊 [NotificationProvider] Reproduzindo som de notificação');
      audioRef.current.currentTime = 0;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('🔊 [NotificationProvider] Som reproduzido com sucesso');
        setLastNotificationTime(now);
      }
    } catch (error) {
      console.error('🔊 [NotificationProvider] Erro ao reproduzir som:', error);
      // Se falhou, pode ser política de autoplay - aguardar interação do usuário
      setIsAudioSupported(false);
    }
  }, [soundEnabled, isAudioSupported, lastNotificationTime]);
  
  // Função pública para testar som
  const testSound = useCallback(async () => {
    if (!audioRef.current) {
      await initializeAudio();
    }
    await playNotificationSound();
  }, [initializeAudio, playNotificationSound]);
  
  // Configurar subscription do Supabase para novos leads
  const setupRealtimeSubscription = useCallback(() => {
    if (!userUnits || userUnits.length === 0 || !soundEnabled) {
      console.log('🔊 [NotificationProvider] Não configurando subscription: unidades não carregadas ou som desabilitado');
      return;
    }
    
    // Cleanup subscription anterior
    if (realtimeSubscriptionRef.current) {
      console.log('🔊 [NotificationProvider] Removendo subscription anterior');
      supabase.removeChannel(realtimeSubscriptionRef.current);
      realtimeSubscriptionRef.current = null;
    }
    
    const unitIds = userUnits.map(unit => unit.unit_id);
    console.log('🔊 [NotificationProvider] Configurando subscription para unidades:', unitIds);
    
    // Criar subscription para novos clientes
    const channel = supabase
      .channel('new-leads-notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: `unit_id=in.(${unitIds.join(',')})`
        },
        (payload) => {
          console.log('🔊 [NotificationProvider] Novo lead detectado via realtime:', payload);
          playNotificationSound();
        }
      )
      .subscribe((status) => {
        console.log('🔊 [NotificationProvider] Status da subscription:', status);
      });
    
    realtimeSubscriptionRef.current = channel;
  }, [userUnits, soundEnabled, playNotificationSound]);
  
  // Função para atualizar configuração de som
  const setSoundEnabled = useCallback((enabled: boolean) => {
    console.log('🔊 [NotificationProvider] Configurando som:', enabled);
    setSoundEnabledState(enabled);
    localStorage.setItem('kanban-sound-enabled', JSON.stringify(enabled));
    
    if (enabled) {
      // Se habilitando, inicializar áudio e subscription
      initializeAudio();
    } else {
      // Se desabilitando, limpar subscription
      if (realtimeSubscriptionRef.current) {
        supabase.removeChannel(realtimeSubscriptionRef.current);
        realtimeSubscriptionRef.current = null;
      }
    }
  }, [initializeAudio]);
  
  // Efeito para inicializar áudio quando som é habilitado
  useEffect(() => {
    if (soundEnabled) {
      initializeAudio();
    }
  }, [soundEnabled, initializeAudio]);
  
  // Efeito para configurar subscription quando unidades carregam ou som muda
  useEffect(() => {
    if (!isLoadingUnits && userUnits) {
      setupRealtimeSubscription();
    }
    
    return () => {
      if (realtimeSubscriptionRef.current) {
        console.log('🔊 [NotificationProvider] Cleanup: removendo subscription');
        supabase.removeChannel(realtimeSubscriptionRef.current);
      }
    };
  }, [isLoadingUnits, userUnits, setupRealtimeSubscription]);
  
  // Marcar como inicializado após primeiro setup
  useEffect(() => {
    if (!isInitializedRef.current && !isLoadingUnits) {
      isInitializedRef.current = true;
      console.log('🔊 [NotificationProvider] Sistema de notificações inicializado');
    }
  }, [isLoadingUnits]);
  
  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log('🔊 [NotificationProvider] Cleanup: removendo áudio');
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (realtimeSubscriptionRef.current) {
        console.log('🔊 [NotificationProvider] Cleanup: removendo subscription');
        supabase.removeChannel(realtimeSubscriptionRef.current);
      }
    };
  }, []);
  
  const value = {
    soundEnabled,
    setSoundEnabled,
    testSound,
    isAudioSupported,
    lastNotificationTime,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}