
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { CalendarSettings, RawCalendarSettings } from './types';
import { validateSession } from './utils/session';

export function useCalendarSettings() {
  return useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      // Log para debug da chamada
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

      console.log('[CalendarSettings] Dados formatados com sucesso');
      return formattedData;
    },
    retry: 2,
    retryDelay: 1000,
    // Adiciona um callback de erro para logging
    meta: {
      onError: (error: Error) => {
        console.error('[CalendarSettings] Erro na query:', error);
      }
    }
  });
}
