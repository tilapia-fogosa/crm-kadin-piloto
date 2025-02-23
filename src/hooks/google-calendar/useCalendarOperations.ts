
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { CalendarSettings, RawCalendarSettings } from './types';

export function useCalendarOperations() {
  const { toast } = useToast();

  const { 
    data: settings, 
    isLoading: isLoadingSettings, 
    refetch: refetchSettings 
  } = useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .single();

      if (error) throw error;
      
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

  const { 
    data: calendars, 
    isLoading: isLoadingCalendars, 
    refetch: refetchCalendars 
  } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      if (!settings?.sync_enabled) return [];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session token available');

      const { data, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { path: 'list-calendars' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      return data.calendars;
    },
    enabled: !!settings?.sync_enabled
  });

  const syncCalendars = async () => {
    try {
      console.log('Iniciando sincronização dos calendários');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session token available');
      
      const { data: settings } = await supabase
        .from('user_calendar_settings')
        .select('selected_calendars')
        .single();

      const { data: response, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { 
          path: 'sync-events',
          calendars: settings?.selected_calendars || []
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

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
    settings,
    calendars,
    isLoading: isLoadingSettings || isLoadingCalendars,
    refetchSettings,
    refetchCalendars,
    syncCalendars,
    updateSelectedCalendars
  };
}
