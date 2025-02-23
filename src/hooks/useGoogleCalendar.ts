
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Json } from '@/integrations/supabase/types';

interface AuthWindowMessage {
  type: 'google-auth-success' | 'google-auth-error';
  code?: string;
  error?: string;
}

export interface Calendar {
  id: string;
  summary: string;
  backgroundColor: string;
  selected?: boolean;
}

interface CalendarSettings {
  google_account_email: string | null;
  sync_enabled: boolean;
  selected_calendars: string[];
  calendars_metadata: Calendar[];
  last_sync: string | null;
}

// Interface para mapear o tipo que vem do Supabase
interface RawCalendarSettings {
  id: string;
  user_id: string;
  google_account_email: string | null;
  google_refresh_token: string | null;
  sync_enabled: boolean;
  selected_calendars: Json;
  calendars_metadata: Json;
  last_sync: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useGoogleCalendar() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  // Fetch calendar settings
  const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      // Converter o dado bruto para o formato esperado
      const rawData = data as RawCalendarSettings;
      const formattedData: CalendarSettings = {
        google_account_email: rawData.google_account_email,
        sync_enabled: rawData.sync_enabled,
        selected_calendars: Array.isArray(rawData.selected_calendars) 
          ? rawData.selected_calendars as string[]
          : [],
        calendars_metadata: Array.isArray(rawData.calendars_metadata) 
          ? (rawData.calendars_metadata as any[]).map(cal => ({
              id: cal.id as string,
              summary: cal.summary as string,
              backgroundColor: cal.backgroundColor as string
            }))
          : [],
        last_sync: rawData.last_sync
      };

      return formattedData;
    }
  });

  // Fetch calendars list
  const { data: calendars, isLoading: isLoadingCalendars, refetch: refetchCalendars } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      if (!settings?.sync_enabled) return [];

      const { data, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { path: 'list-calendars' }
      });

      if (error) throw error;
      return data.calendars as Calendar[];
    },
    enabled: !!settings?.sync_enabled
  });

  useEffect(() => {
    // Listener para mensagens do popup
    const handleMessage = async (event: MessageEvent<AuthWindowMessage>) => {
      // Verificar origem da mensagem
      if (event.origin !== window.location.origin) {
        console.log('Mensagem recebida de origem não permitida:', event.origin);
        return;
      }

      console.log('Mensagem recebida:', event.data);

      if (event.data?.type === 'google-auth-success' && event.data.code) {
        console.log('Código de autorização recebido');
        await handleAuthCallback(event.data.code);
      } else if (event.data?.type === 'google-auth-error') {
        console.error('Erro na autenticação:', event.data.error);
        toast({
          title: "Erro na conexão",
          description: "Não foi possível conectar com o Google Calendar",
          variant: "destructive"
        });
        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Monitorar fechamento do popup
    if (authWindow) {
      const checkWindow = setInterval(() => {
        try {
          if (authWindow.closed) {
            console.log('Popup fechado');
            setAuthWindow(null);
            setIsConnecting(false);
            clearInterval(checkWindow);
          }
        } catch (error) {
          // Ignora erros de acesso cross-origin
          console.log('Erro ao verificar estado do popup');
        }
      }, 500);

      return () => clearInterval(checkWindow);
    }
  }, [authWindow]);

  const startGoogleAuth = async () => {
    try {
      setIsConnecting(true);
      
      console.log('Iniciando autenticação com Google Calendar');

      // Obter a sessão atual do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { path: 'init' }
      });

      if (error) throw error;

      console.log('URL de autenticação recebida:', data.url);

      // Configurações da janela de popup
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // Abrir popup centralizado
      const popup = window.open(
        data.url,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        console.log('Popup aberto com sucesso');
        setAuthWindow(popup);
      } else {
        throw new Error('Popup bloqueado pelo navegador');
      }

    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
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

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          path: 'callback',
          code 
        }
      });

      if (error) throw error;

      console.log('Autenticação completada com sucesso');
      toast({
        title: "Conexão realizada",
        description: "Google Calendar conectado com sucesso!",
      });

      // Atualizar dados
      await refetchSettings();
      await refetchCalendars();

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

  const syncCalendars = async () => {
    try {
      console.log('Iniciando sincronização dos calendários');
      
      const { data: settings } = await supabase
        .from('user_calendar_settings')
        .select('selected_calendars')
        .single();

      const { data: response, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { 
          path: 'sync-events',
          calendars: settings?.selected_calendars || []
        }
      });

      if (error) throw error;

      // Atualizar timestamp da última sincronização
      await supabase
        .from('user_calendar_settings')
        .update({ 
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      await refetchSettings();
      
      toast({
        title: "Sincronização concluída",
        description: "Calendários atualizados com sucesso!",
      });

      return response.events;
    } catch (error) {
      console.error('Erro ao sincronizar calendários:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os calendários",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSelectedCalendars = async (calendarIds: string[]) => {
    try {
      const { error } = await supabase
        .from('user_calendar_settings')
        .update({ 
          selected_calendars: calendarIds,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      await refetchSettings();
      await refetchCalendars();

      toast({
        title: "Calendários atualizados",
        description: "Suas preferências foram salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar calendários:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas preferências",
        variant: "destructive"
      });
    }
  };

  return {
    isConnecting,
    isLoading: isLoadingSettings || isLoadingCalendars,
    settings,
    calendars,
    startGoogleAuth,
    handleAuthCallback,
    syncCalendars,
    updateSelectedCalendars
  };
}
