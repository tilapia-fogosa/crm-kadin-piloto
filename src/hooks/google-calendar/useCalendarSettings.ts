
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { CalendarSettings, RawCalendarSettings } from './types';
import { validateSession } from './utils/session';

export function useCalendarSettings() {
  return useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      console.log('[CalendarSettings] Iniciando busca de configurações');

      const accessToken = await validateSession();
      if (!accessToken) {
        console.error('[CalendarSettings] Sem token de acesso disponível');
        throw new Error('No session token available');
      }

      console.log('[CalendarSettings] Token validado, buscando configurações');

      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('[CalendarSettings] Erro ao buscar configurações:', error);
        throw error;
      }
      
      if (!data) {
        console.log('[CalendarSettings] Nenhuma configuração encontrada');
        return null;
      }
      
      console.log('[CalendarSettings] Configurações encontradas, formatando dados');
      
      // Fazer cast explícito dos dados JSON para os tipos corretos
      const formattedData: CalendarSettings = {
        google_account_email: data.google_account_email,
        sync_enabled: Boolean(data.sync_enabled),
        google_refresh_token: data.google_refresh_token,
        selected_calendars: Array.isArray(data.selected_calendars) 
          ? data.selected_calendars as string[]
          : [],
        calendars_metadata: Array.isArray(data.calendars_metadata) 
          ? (data.calendars_metadata as any[]).map(cal => ({
              id: String(cal.id),
              summary: String(cal.summary),
              backgroundColor: String(cal.backgroundColor)
            }))
          : [],
        last_sync: data.last_sync,
        sync_token: data.sync_token,
        default_calendar_id: data.default_calendar_id
      };

      console.log('[CalendarSettings] Dados formatados com sucesso');
      return formattedData;
    },
    retry: 2,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        console.error('[CalendarSettings] Erro na query:', error);
      }
    }
  });
}
