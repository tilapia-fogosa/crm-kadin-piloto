
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { CalendarSettings, RawCalendarSettings } from '../types';
import { validateSession } from './utils/session';

export function useCalendarSettings() {
  return useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      const accessToken = await validateSession();
      if (!accessToken) {
        throw new Error('No session token available');
      }

      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
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
        last_sync: rawData.last_sync,
        sync_token: rawData.sync_token,
        default_calendar_id: rawData.default_calendar_id
      };

      return formattedData;
    },
    retry: 2,
    retryDelay: 1000
  });
}
