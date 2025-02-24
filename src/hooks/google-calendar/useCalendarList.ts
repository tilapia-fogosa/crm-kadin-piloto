
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      if (!settings?.sync_enabled) {
        console.log('[CalendarOperations] Calendar sync is disabled or settings not found');
        return [];
      }

      console.log('[CalendarOperations] Fetching calendars from Google...');
      const { data, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { path: 'list-calendars' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('[CalendarOperations] Error fetching calendars:', error);
        if (error.message.includes('token')) {
          toast({
            title: "Erro de autenticação",
            description: "Por favor, reconecte sua conta do Google Calendar",
            variant: "destructive"
          });
        }
        throw error;
      }

      if (data.calendars) {
        const formattedCalendars = data.calendars.map(cal => ({
          id: cal.id,
          summary: cal.summary,
          backgroundColor: cal.backgroundColor || '#4285f4'
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error('User ID not found');
        }

        try {
          const { error: updateError } = await supabase
            .from('user_calendar_settings')
            .update({ 
              calendars_metadata: formattedCalendars,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[CalendarOperations] Error updating calendar metadata:', updateError);
          }
        } catch (updateError) {
          console.error('[CalendarOperations] Failed to update calendar metadata:', updateError);
        }

        return formattedCalendars;
      }

      return [];
    },
    enabled: !!settings?.sync_enabled && !!settings?.google_account_email,
    retry: 2,
    retryDelay: 1000
  });
}
