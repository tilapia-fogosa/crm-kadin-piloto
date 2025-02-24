
import { CALENDAR_API_URL } from '../constants.ts';
import { addDays, subDays } from "https://esm.sh/date-fns@2.30.0";

export const syncEvents = async (accessToken: string, calendars: string[], syncToken: string | null, supabaseClient: any, userId: string) => {
  console.log('[syncEvents] Iniciando sincronização', {
    calendarCount: calendars.length,
    hasSyncToken: !!syncToken
  });

  const now = new Date();
  const timeMin = subDays(now, 7).toISOString();
  const timeMax = addDays(now, 30).toISOString();
  
  let allEvents = [];
  let nextSyncToken = null;

  const processEvents = (events: any[], calendarId: string, calendarName: string, backgroundColor: string) => {
    console.log('[syncEvents] Processando eventos do calendário:', {
      calendarId,
      eventCount: events.length
    });

    return events.map(event => ({
      id: event.id,
      google_event_id: event.id,
      calendar_id: calendarId,
      calendar_name: calendarName,
      calendar_background_color: backgroundColor,
      title: event.summary || '(Sem título)',
      description: event.description,
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      is_recurring: !!event.recurrence,
      recurring_rule: event.recurrence?.[0],
      user_id: userId,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: true
    }));
  };

  const cleanupOldEvents = async () => {
    console.log('[syncEvents] Limpando eventos antigos');
    const { error: cleanupError } = await supabaseClient
      .from('calendar_events')
      .delete()
      .or(`start_time.lt.${timeMin},end_time.gt.${timeMax}`)
      .eq('user_id', userId);

    if (cleanupError) {
      console.error('[syncEvents] Erro ao limpar eventos antigos:', cleanupError);
    }
  };

  for (const calendarId of calendars) {
    console.log('[syncEvents] Iniciando sincronização do calendário:', calendarId);
    
    let params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      maxResults: '2500',
    });

    if (syncToken) {
      params = new URLSearchParams({
        syncToken,
        maxResults: '2500',
      });
    }

    const eventsResponse = await fetch(
      `${CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!eventsResponse.ok) {
      const errorData = await eventsResponse.json();
      console.error('[syncEvents] Erro na resposta do Google:', {
        status: eventsResponse.status,
        error: errorData
      });
      
      if (errorData.error?.code === 410) {
        console.log('[syncEvents] Token de sincronização expirado, realizando sincronização completa');
        params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          maxResults: '2500',
        });
        
        const fullSyncResponse = await fetch(
          `${CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!fullSyncResponse.ok) {
          console.error('[syncEvents] Falha na sincronização completa:', await fullSyncResponse.text());
          throw new Error(`Failed to fetch events after sync token expired: ${await fullSyncResponse.text()}`);
        }
        
        const data = await fullSyncResponse.json();
        nextSyncToken = data.nextSyncToken;
        
        if (data.items?.length) {
          const calendarInfo = data.items[0]?.organizer || {};
          console.log('[syncEvents] Eventos obtidos após sincronização completa:', {
            calendarId,
            eventCount: data.items.length
          });
          
          allEvents = [
            ...allEvents,
            ...processEvents(
              data.items,
              calendarId,
              calendarInfo.displayName || 'Calendário Google',
              '#4285f4'
            ),
          ];
        }
      } else {
        throw new Error(`Failed to fetch events: ${await eventsResponse.text()}`);
      }
    } else {
      const data = await eventsResponse.json();
      nextSyncToken = data.nextSyncToken;
      
      if (data.items?.length) {
        const calendarInfo = data.items[0]?.organizer || {};
        console.log('[syncEvents] Eventos obtidos com sucesso:', {
          calendarId,
          eventCount: data.items.length
        });
        
        allEvents = [
          ...allEvents,
          ...processEvents(
            data.items,
            calendarId,
            calendarInfo.displayName || 'Calendário Google',
            '#4285f4'
          ),
        ];
      }
    }
  }

  await cleanupOldEvents();

  if (allEvents.length > 0) {
    console.log('[syncEvents] Salvando eventos no banco de dados:', {
      totalEvents: allEvents.length
    });
    
    const { error: upsertError } = await supabaseClient
      .from('calendar_events')
      .upsert(allEvents, {
        onConflict: 'google_event_id,user_id'
      });

    if (upsertError) {
      console.error('[syncEvents] Erro ao salvar eventos:', upsertError);
      throw new Error(`Failed to upsert events: ${upsertError.message}`);
    }
  }

  console.log('[syncEvents] Sincronização concluída com sucesso:', {
    totalEvents: allEvents.length,
    hasSyncToken: !!nextSyncToken
  });

  return { events: allEvents, nextSyncToken };
};
