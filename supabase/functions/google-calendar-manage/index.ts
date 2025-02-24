
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { addDays, subDays } from "https://esm.sh/date-fns@2.30.0";

const CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { path, calendars, syncToken } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    const { data: settings } = await supabaseClient
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .eq('user_id', user.id)
      .single();

    if (!settings?.google_refresh_token) {
      throw new Error('No refresh token found');
    }

    // Renovar o token de acesso usando o refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: settings.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(`Failed to refresh token: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;

    switch (path) {
      case 'list-calendars':
        const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!calResponse.ok) {
          throw new Error(`Failed to fetch calendars: ${await calResponse.text()}`);
        }

        const calData = await calResponse.json();
        return new Response(JSON.stringify({ calendars: calData.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'sync-events': {
        const now = new Date();
        const timeMin = subDays(now, 7).toISOString(); // 7 dias atrás
        const timeMax = addDays(now, 30).toISOString(); // 1 mês à frente
        
        let allEvents = [];
        let nextSyncToken = null;

        // Limpeza automática de eventos antigos
        const cleanupOldEvents = async () => {
          const { error: cleanupError } = await supabaseClient
            .from('calendar_events')
            .delete()
            .or(
              `start_time.lt.${timeMin},end_time.gt.${timeMax}`
            )
            .eq('user_id', user.id);

          if (cleanupError) {
            console.error('[google-calendar-manage] Error cleaning up old events:', cleanupError);
          }
        };

        // Função para processar eventos
        const processEvents = (events, calendarId, calendarName, backgroundColor) => {
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
            user_id: user.id,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            active: true
          }));
        };

        for (const calendarId of calendars) {
          let params = new URLSearchParams({
            timeMin,
            timeMax,
            singleEvents: 'true', // Expande eventos recorrentes
            maxResults: '2500',
          });

          // Usa syncToken se disponível, caso contrário faz sincronização completa
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
            
            // Se o syncToken expirou, faz uma sincronização completa
            if (errorData.error?.code === 410) {
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
                throw new Error(`Failed to fetch events after sync token expired: ${await fullSyncResponse.text()}`);
              }
              
              const data = await fullSyncResponse.json();
              nextSyncToken = data.nextSyncToken;
              
              if (data.items?.length) {
                const calendarInfo = data.items[0]?.organizer || {};
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

        // Limpa eventos antigos antes de inserir os novos
        await cleanupOldEvents();

        // Insere os novos eventos
        if (allEvents.length > 0) {
          const { error: upsertError } = await supabaseClient
            .from('calendar_events')
            .upsert(allEvents, {
              onConflict: 'google_event_id,user_id'
            });

          if (upsertError) {
            throw new Error(`Failed to upsert events: ${upsertError.message}`);
          }
        }

        return new Response(
          JSON.stringify({
            events: allEvents,
            nextSyncToken
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'revoke-access': {
        if (!settings?.google_refresh_token) {
          throw new Error('No refresh token to revoke');
        }

        const revokeResponse = await fetch(
          `https://oauth2.googleapis.com/revoke?token=${settings.google_refresh_token}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (!revokeResponse.ok) {
          console.error('Failed to revoke token:', await revokeResponse.text());
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('[google-calendar-manage] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

