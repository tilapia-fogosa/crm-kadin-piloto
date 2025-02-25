
import { corsHeaders } from '../utils/cors';
import { getGoogleClient } from '../utils/googleClient';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Interface para tipagem dos eventos do Google Calendar
interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export async function syncCalendarEvents(req: Request) {
  console.log('[SyncEvents] Iniciando sincronização de eventos');

  try {
    // Criar cliente Google usando o adaptador
    const googleClient = await getGoogleClient(req.headers.get('Authorization'));
    console.log('[SyncEvents] Cliente Google criado com sucesso');

    // Buscar calendários selecionados do body
    const { selectedCalendars } = await req.json();
    console.log('[SyncEvents] Calendários para sincronizar:', selectedCalendars);

    if (!Array.isArray(selectedCalendars) || selectedCalendars.length === 0) {
      console.error('[SyncEvents] Nenhum calendário selecionado');
      throw new Error('No calendars selected for sync');
    }

    // Sincronizar eventos de cada calendário
    const allEvents: GoogleEvent[] = [];
    for (const calendarId of selectedCalendars) {
      console.log(`[SyncEvents] Sincronizando calendário: ${calendarId}`);
      
      const response = await googleClient.request({
        url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        params: {
          timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // último mês
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // próximo mês
          singleEvents: 'true',
          orderBy: 'startTime'
        }
      });

      if (response.items) {
        allEvents.push(...response.items);
      }
    }

    console.log('[SyncEvents] Total de eventos encontrados:', allEvents.length);

    // Retornar eventos sincronizados
    return new Response(JSON.stringify({ events: allEvents }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('[SyncEvents] Erro durante sincronização:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}
