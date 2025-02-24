import { useEffect, useRef, useCallback } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { useCalendarOperations } from './useCalendarOperations';
import { AuthWindowMessage } from './types';

export function useGoogleCalendar() {
  const processingCodeRef = useRef<string | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    settings,
    calendars,
    isLoading,
    refetchSettings,
    refetchCalendars,
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  } = useCalendarOperations();

  const handleAuthSuccess = useCallback(async () => {
    console.log('[GoogleCalendar] Iniciando processo pós-autenticação');
    
    // Delay inicial para garantir que todos os dados estão sincronizados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await refetchSettings();
      await refetchCalendars();
      console.log('[GoogleCalendar] Dados atualizados com sucesso');
    } catch (error) {
      console.error('[GoogleCalendar] Erro ao atualizar dados:', error);
      throw error;
    }
  }, [refetchSettings, refetchCalendars]);

  const {
    isConnecting,
    authWindow,
    setAuthWindow,
    startGoogleAuth,
    handleAuthCallback
  } = useGoogleAuth(handleAuthSuccess);

  // Monitor do popup de autenticação
  useEffect(() => {
    if (authWindow) {
      console.log('[GoogleCalendar] Iniciando monitoramento do popup');
      
      // Verifica o estado do popup a cada 500ms
      authCheckIntervalRef.current = setInterval(() => {
        try {
          if (authWindow.closed) {
            console.log('[GoogleCalendar] Popup fechado pelo usuário');
            setAuthWindow(null);
            
            // Limpa todos os timeouts e intervals
            if (authCheckIntervalRef.current) {
              clearInterval(authCheckIntervalRef.current);
            }
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
            }
          }
        } catch (error) {
          console.error('[GoogleCalendar] Erro ao verificar estado do popup:', error);
        }
      }, 500);

      // Cleanup ao desmontar
      return () => {
        if (authCheckIntervalRef.current) {
          clearInterval(authCheckIntervalRef.current);
        }
      };
    }
  }, [authWindow, setAuthWindow]);

  // Gerenciamento de mensagens do popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent<AuthWindowMessage>) => {
      // Validação de origem
      if (event.origin !== window.location.origin) {
        console.log('[GoogleCalendar] Mensagem recebida de origem não permitida:', event.origin);
        return;
      }

      console.log('[GoogleCalendar] Mensagem recebida:', event.data);

      if (event.data?.type === 'google-auth-success' && event.data.code) {
        const code = event.data.code;
        
        // Prevenir processamento duplicado do mesmo código
        if (processingCodeRef.current === code) {
          console.log('[GoogleCalendar] Código já está sendo processado:', code);
          return;
        }
        
        // Limpar timeout anterior se existir
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingCodeRef.current = code;
        console.log('[GoogleCalendar] Código de autorização recebido');
        
        try {
          await handleAuthCallback(code);
        } finally {
          // Limpar o código após um delay para evitar duplicações
          processingTimeoutRef.current = setTimeout(() => {
            processingCodeRef.current = null;
            processingTimeoutRef.current = null;
          }, 5000); // 5 segundos de proteção contra duplicação
        }
      } else if (event.data?.type === 'google-auth-error') {
        console.error('[GoogleCalendar] Erro na autenticação:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Limpar timeouts no cleanup
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
    };
  }, [handleAuthCallback]);

  return {
    isConnecting,
    isLoading,
    settings,
    calendars,
    startGoogleAuth,
    handleAuthCallback,
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  };
}

export type { Calendar, CalendarSettings } from './types';
