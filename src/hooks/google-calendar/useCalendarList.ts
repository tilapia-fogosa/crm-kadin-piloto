
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSession } from './utils/session';
import type { CalendarSettings } from './types';

export function useCalendarList(settings: CalendarSettings | null | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('[CalendarList] Sem token de sessão');
          throw new Error('No session token available');
        }

        if (!settings?.sync_enabled) {
          console.log('[CalendarList] Sincronização desabilitada ou configurações não encontradas');
          return [];
        }

        if (!settings?.google_account_email) {
          console.error('[CalendarList] Conta Google não conectada');
          throw new Error('Google account not connected');
        }

        console.log('[CalendarList] Buscando calendários do Google...');
        const { data, error } = await supabase.functions.invoke('google-calendar-manage', {
          body: { 
            path: 'list-calendars'
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.error('[CalendarList] Erro ao buscar calendários:', error);
          
          // Erros específicos de autenticação
          if (error.message?.toLowerCase().includes('token') || 
              error.message?.toLowerCase().includes('auth')) {
            toast({
              title: "Erro de autenticação",
              description: "Por favor, reconecte sua conta do Google Calendar",
              variant: "destructive"
            });
            throw new Error('Authentication failed');
          }

          // Outros erros
          toast({
            title: "Erro ao sincronizar",
            description: "Não foi possível buscar seus calendários. Tente novamente mais tarde.",
            variant: "destructive"
          });
          throw error;
        }

        if (!data?.calendars) {
          console.error('[CalendarList] Resposta sem calendários');
          throw new Error('No calendars in response');
        }

        console.log('[CalendarList] Calendários obtidos:', data.calendars.length);

        const formattedCalendars = data.calendars.map(cal => ({
          id: cal.id,
          summary: cal.summary,
          backgroundColor: cal.backgroundColor || '#4285f4'
        }));

        // Atualizar metadados no banco
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error('User ID not found');
        }

        try {
          const { error: updateError } = await supabase
            .from('user_calendar_settings')
            .update({ 
              calendars_metadata: formattedCalendars,
              last_sync: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[CalendarList] Erro ao atualizar metadados:', updateError);
          }
        } catch (updateError) {
          console.error('[CalendarList] Falha ao atualizar metadados:', updateError);
        }

        return formattedCalendars;
      } catch (error) {
        console.error('[CalendarList] Erro não tratado:', error);
        throw error;
      }
    },
    enabled: !!settings?.sync_enabled && !!settings?.google_account_email,
    retry: (failureCount, error) => {
      // Não tentar novamente em erros de autenticação
      if (error.message?.toLowerCase().includes('auth')) {
        return false;
      }
      // Tentar mais vezes para outros erros
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000)
  });
}
