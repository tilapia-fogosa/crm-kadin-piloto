
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Calendar } from '../types';
import { getGoogleClient } from '../utils/auth';
import { corsHeaders } from '../utils/cors';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function syncEvents(calendars: string[], syncToken: string | null, userId: string) {
  console.log('[SyncEvents] Iniciando sincronização para usuário:', userId);
  console.log('[SyncEvents] Calendários:', calendars);
  console.log('[SyncEvents] Token de sincronização:', syncToken);

  const googleClient = await getGoogleClient(userId);
  const allEvents = [];
  let latestSyncToken = null;

  for (const calendarId of calendars) {
    console.log(`[SyncEvents] Processando calendário: ${calendarId}`);
    
    try {
      const response = await googleClient.request({
        url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        params: {
          syncToken: syncToken,
          showDeleted: true,
          singleEvents: true,
          maxResults: 2500
        }
      });

      const events = response.data.items || [];
      const calendarInfo = await googleClient.request({
        url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}`
      });

      console.log(`[SyncEvents] Recebidos ${events.length} eventos do calendário ${calendarId}`);

      const formattedEvents = events
        .filter(event => event.id && event.start) // Filtra eventos sem ID ou data
        .map(event => {
          const eventData = {
            id: crypto.randomUUID(),
            google_event_id: event.id,
            user_id: userId,
            calendar_id: calendarId,
            calendar_name: calendarInfo.data.summary,
            calendar_background_color: calendarInfo.data.backgroundColor,
            title: event.summary || 'Sem título',
            description: event.description,
            start_time: event.start.dateTime || event.start.date,
            end_time: event.end.dateTime || event.end.date,
            is_recurring: !!event.recurrence,
            recurring_rule: event.recurrence?.[0],
            sync_status: event.status === 'cancelled' ? 'deleted' : 'synced',
            active: event.status !== 'cancelled',
            last_synced_at: new Date().toISOString()
          };

          console.log(`[SyncEvents] Evento formatado:`, {
            id: eventData.id,
            google_event_id: eventData.google_event_id,
            title: eventData.title,
            calendar: eventData.calendar_id
          });

          return eventData;
        });

      allEvents.push(...formattedEvents);
      latestSyncToken = response.data.nextSyncToken;
      
      console.log(`[SyncEvents] Eventos formatados para ${calendarId}:`, formattedEvents.length);
    } catch (error) {
      console.error(`[SyncEvents] Erro ao buscar eventos do calendário ${calendarId}:`, error);
      throw error;
    }
  }

  if (allEvents.length > 0) {
    console.log('[SyncEvents] Iniciando upsert de', allEvents.length, 'eventos');
    
    try {
      const { error: upsertError } = await supabaseAdmin
        .from('calendar_events')
        .upsert(allEvents, {
          onConflict: 'google_event_id,user_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('[SyncEvents] Erro no upsert:', upsertError);
        throw upsertError;
      }

      console.log('[SyncEvents] Eventos salvos com sucesso');
    } catch (error) {
      console.error('[SyncEvents] Erro ao salvar eventos:', error);
      throw error;
    }
  }

  // Atualiza o token de sincronização
  if (latestSyncToken) {
    console.log('[SyncEvents] Atualizando token de sincronização:', latestSyncToken);
    
    try {
      const { error: updateError } = await supabaseAdmin
        .from('user_calendar_settings')
        .update({ 
          sync_token: latestSyncToken,
          last_sync: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[SyncEvents] Erro ao atualizar token:', updateError);
        throw updateError;
      }

      console.log('[SyncEvents] Token atualizado com sucesso');
    } catch (error) {
      console.error('[SyncEvents] Erro ao atualizar token:', error);
      throw error;
    }
  }

  return {
    events_processed: allEvents.length,
    sync_token: latestSyncToken
  };
}
