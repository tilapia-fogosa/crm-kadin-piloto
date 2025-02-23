
import { useEffect, useRef } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { useCalendarOperations } from './useCalendarOperations';
import type { AuthWindowMessage } from './types';

export function useGoogleCalendar() {
  const processingCodeRef = useRef<string | null>(null);
  
  const { 
    settings,
    calendars,
    isLoading,
    refetchSettings,
    refetchCalendars,
    syncCalendars,
    updateSelectedCalendars
  } = useCalendarOperations();

  const {
    isConnecting,
    authWindow,
    setAuthWindow,
    startGoogleAuth,
    handleAuthCallback
  } = useGoogleAuth(async () => {
    await refetchSettings();
    await refetchCalendars();
  });

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<AuthWindowMessage>) => {
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
        
        processingCodeRef.current = code;
        console.log('[GoogleCalendar] Código de autorização recebido');
        
        try {
          await handleAuthCallback(code);
        } finally {
          // Limpar o código após processamento
          processingCodeRef.current = null;
        }
      } else if (event.data?.type === 'google-auth-error') {
        console.error('[GoogleCalendar] Erro na autenticação:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleAuthCallback]);

  useEffect(() => {
    if (authWindow) {
      const checkWindow = setInterval(() => {
        try {
          if (authWindow.closed) {
            console.log('Popup fechado');
            setAuthWindow(null);
            clearInterval(checkWindow);
          }
        } catch (error) {
          console.log('Erro ao verificar estado do popup');
        }
      }, 500);

      return () => clearInterval(checkWindow);
    }
  }, [authWindow, setAuthWindow]);

  return {
    isConnecting,
    isLoading,
    settings,
    calendars,
    startGoogleAuth,
    handleAuthCallback,
    syncCalendars,
    updateSelectedCalendars
  };
}

export type { Calendar, CalendarSettings } from './types';
