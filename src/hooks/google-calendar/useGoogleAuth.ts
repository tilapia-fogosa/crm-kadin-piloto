
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthWindowMessage } from './types';

export function useGoogleAuth(onAuthSuccess: () => Promise<void>) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  const startGoogleAuth = async () => {
    try {
      setIsConnecting(true);
      
      console.log('[GoogleCalendar] Iniciando autenticação');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('[GoogleCalendar] Erro de sessão:', sessionError);
        throw new Error('Usuário não autenticado');
      }

      if (!session.access_token) {
        console.error('[GoogleCalendar] Token de acesso não disponível');
        throw new Error('Token de acesso não disponível');
      }

      console.log('[GoogleCalendar] Sessão válida, obtendo URL de autenticação');

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { path: 'init' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('[GoogleCalendar] Erro ao obter URL:', error);
        throw error;
      }

      console.log('[GoogleCalendar] URL de autenticação recebida:', data.url);

      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        console.log('[GoogleCalendar] Popup aberto com sucesso');
        setAuthWindow(popup);
      } else {
        console.error('[GoogleCalendar] Popup bloqueado pelo navegador');
        throw new Error('Popup bloqueado pelo navegador');
      }

    } catch (error) {
      console.error('[GoogleCalendar] Erro ao iniciar autenticação:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google Calendar. Verifique se os popups estão permitidos.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const handleAuthCallback = async (code: string): Promise<boolean> => {
    try {
      console.log('Processando callback com código:', code);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session token available');

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          path: 'callback',
          code 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      console.log('Autenticação completada com sucesso');
      toast({
        title: "Conexão realizada",
        description: "Google Calendar conectado com sucesso!",
      });

      await onAuthSuccess();

      return true;
    } catch (error) {
      console.error('Erro ao processar callback:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível completar a conexão com o Google Calendar",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsConnecting(false);
      if (authWindow) {
        authWindow.close();
        setAuthWindow(null);
      }
    }
  };

  return {
    isConnecting,
    authWindow,
    setAuthWindow,
    startGoogleAuth,
    handleAuthCallback
  };
}
