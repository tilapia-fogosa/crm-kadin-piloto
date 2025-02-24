
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCalendarActions() {
  const { toast } = useToast();

  const syncCalendars = async () => {
    try {
      console.log('[CalendarActions] Iniciando sincronização dos calendários');

      const { data: settings } = await supabase
        .from('user_calendar_settings')
        .select('selected_calendars, sync_token')
        .single();

      if (!settings?.selected_calendars) {
        throw new Error('No calendars selected');
      }

      const { data: response, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { 
          path: 'sync-events',
          calendars: settings.selected_calendars,
          syncToken: settings.sync_token
        }
      });

      if (error) throw error;
      console.log('[CalendarActions] Sincronização concluída:', response);
      
      return response;
    } catch (error) {
      console.error('[CalendarActions] Erro na sincronização:', error);
      throw error;
    }
  };

  const updateSelectedCalendars = async (calendarIds: string[]) => {
    try {
      console.log('[CalendarActions] Atualizando calendários selecionados:', calendarIds);
      
      const { error } = await supabase
        .from('user_calendar_settings')
        .update({ 
          selected_calendars: calendarIds,
          sync_token: null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('[CalendarActions] Calendários atualizados com sucesso');
    } catch (error) {
      console.error('[CalendarActions] Erro ao atualizar calendários:', error);
      throw error;
    }
  };

  const setDefaultCalendar = async (calendarId: string) => {
    try {
      console.log('[CalendarActions] Definindo calendário padrão:', calendarId);
      
      const { error } = await supabase
        .from('user_calendar_settings')
        .update({ 
          default_calendar_id: calendarId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('[CalendarActions] Calendário padrão atualizado com sucesso');
    } catch (error) {
      console.error('[CalendarActions] Erro ao definir calendário padrão:', error);
      throw error;
    }
  };

  const disconnectCalendar = async () => {
    try {
      console.log('[CalendarActions] Iniciando processo de desconexão');
      
      const { error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { path: 'revoke-access' }
      });

      if (error) throw error;
      console.log('[CalendarActions] Desconexão concluída com sucesso');
    } catch (error) {
      console.error('[CalendarActions] Erro ao desconectar:', error);
      throw error;
    }
  };

  return {
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  };
}
