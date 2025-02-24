
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { decode } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_OAUTH_API = 'https://oauth2.googleapis.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const [_header, payload] = decode(token);
    const userId = payload.sub as string;

    if (!userId) {
      throw new Error('Invalid JWT token: no user id found');
    }

    console.log('[google-calendar-manage] User ID from JWT:', userId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    const { path, calendars = [], syncToken = null } = await req.json();

    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.google_refresh_token) {
      console.error('[google-calendar-manage] Error fetching settings:', settingsError);
      throw new Error('No refresh token found');
    }

    console.log('[google-calendar-manage] Found refresh token for user');

    const tokenResponse = await fetch(`${GOOGLE_OAUTH_API}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: settings.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('[google-calendar-manage] Failed to refresh access token:', tokenData);
      throw new Error('Failed to refresh access token');
    }

    const access_token = tokenData.access_token;
    console.log('[google-calendar-manage] Successfully refreshed access token');

    switch (path) {
      case 'list-calendars': {
        console.log('[google-calendar-manage] Listing calendars...');
        const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('[google-calendar-manage] Error fetching calendars:', error);
          throw new Error(`Failed to fetch calendars: ${error}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify({ calendars: data.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync-events': {
        console.log('[google-calendar-manage] Syncing events...');
        const allEvents = [];
        const processedEventIds = new Set();
        let nextSyncToken = null;

        // Processa cada calendário selecionado
        for (const calendarId of calendars) {
          console.log(`[google-calendar-manage] Fetching events for calendar ${calendarId}`);
          
          try {
            let apiUrl = `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`;
            let params = new URLSearchParams({
              singleEvents: 'true',
              orderBy: 'updated',
            });

            // Se não temos um syncToken, fazemos uma sincronização completa com filtros de tempo
            if (!syncToken) {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              const threeMonthsAhead = new Date();
              threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

              params.append('timeMin', threeMonthsAgo.toISOString());
              params.append('timeMax', threeMonthsAhead.toISOString());
            } else {
              // Se temos um syncToken, usamos apenas ele
              params.append('syncToken', syncToken);
            }

            const response = await fetch(`${apiUrl}?${params.toString()}`, {
              headers: { Authorization: `Bearer ${access_token}` },
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('[google-calendar-manage] Error fetching events:', errorData);

              // Se o syncToken expirou (410) ou é inválido (400), fazemos uma sincronização completa
              if (response.status === 410 || 
                  (response.status === 400 && errorData.error?.message?.includes('sync token'))) {
                console.log('[google-calendar-manage] Invalid sync token, performing full sync');
                
                // Remover o syncToken e tentar novamente com filtros de tempo
                params = new URLSearchParams({
                  singleEvents: 'true',
                  orderBy: 'updated',
                  timeMin: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
                  timeMax: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
                });

                const retryResponse = await fetch(`${apiUrl}?${params.toString()}`, {
                  headers: { Authorization: `Bearer ${access_token}` },
                });

                if (!retryResponse.ok) {
                  throw new Error(`Failed to fetch events after sync token reset: ${await retryResponse.text()}`);
                }

                const retryData = await retryResponse.json();
                nextSyncToken = retryData.nextSyncToken;

                // Processar eventos da sincronização completa
                if (retryData.items) {
                  for (const event of retryData.items) {
                    if (!processedEventIds.has(event.id) && event.start?.dateTime && event.end?.dateTime) {
                      processedEventIds.add(event.id);
                      allEvents.push({
                        google_event_id: event.id,
                        title: event.summary || 'Sem título',
                        description: event.description,
                        start_time: event.start.dateTime,
                        end_time: event.end.dateTime,
                        calendar_id: calendarId,
                        calendar_name: event.organizer?.displayName,
                        is_recurring: !!event.recurrence,
                        recurring_rule: event.recurrence ? event.recurrence[0] : null,
                        calendar_background_color: event.colorId ? `#${event.colorId}` : '#4285f4',
                        user_id: userId,
                        sync_status: 'synced',
                        last_synced_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      });
                    }
                  }
                }
              } else {
                throw new Error(`Failed to fetch events: ${JSON.stringify(errorData)}`);
              }
            } else {
              const data = await response.json();
              nextSyncToken = data.nextSyncToken;

              if (data.items) {
                for (const event of data.items) {
                  // Ignorar eventos cancelados
                  if (event.status === 'cancelled') {
                    console.log(`[google-calendar-manage] Removing cancelled event: ${event.id}`);
                    await supabaseClient
                      .from('calendar_events')
                      .update({ 
                        active: false,
                        updated_at: new Date().toISOString()
                      })
                      .eq('google_event_id', event.id)
                      .eq('user_id', userId);
                    continue;
                  }

                  // Processar apenas eventos com data/hora definida
                  if (!processedEventIds.has(event.id) && event.start?.dateTime && event.end?.dateTime) {
                    processedEventIds.add(event.id);
                    allEvents.push({
                      google_event_id: event.id,
                      title: event.summary || 'Sem título',
                      description: event.description,
                      start_time: event.start.dateTime,
                      end_time: event.end.dateTime,
                      calendar_id: calendarId,
                      calendar_name: event.organizer?.displayName,
                      is_recurring: !!event.recurrence,
                      recurring_rule: event.recurrence ? event.recurrence[0] : null,
                      calendar_background_color: event.colorId ? `#${event.colorId}` : '#4285f4',
                      user_id: userId,
                      sync_status: 'synced',
                      last_synced_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error(`[google-calendar-manage] Error processing calendar ${calendarId}:`, error);
            continue;
          }
        }

        // Upsert todos os eventos coletados
        if (allEvents.length > 0) {
          const { error: upsertError } = await supabaseClient
            .from('calendar_events')
            .upsert(allEvents, {
              onConflict: 'google_event_id,user_id'
            });

          if (upsertError) {
            console.error('[google-calendar-manage] Error upserting events:', upsertError);
            throw upsertError;
          }
        }

        // Atualizar o token de sincronização
        if (nextSyncToken) {
          await supabaseClient
            .from('user_calendar_settings')
            .update({
              sync_token: nextSyncToken,
              last_sync: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }

        return new Response(
          JSON.stringify({
            success: true,
            nextSyncToken,
            events: allEvents
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'revoke-access': {
        console.log('[google-calendar-manage] Revoking access...');
        
        await fetch(`${GOOGLE_OAUTH_API}/revoke?token=${access_token}`, {
          method: 'POST',
        });

        if (settings.google_refresh_token) {
          await fetch(`${GOOGLE_OAUTH_API}/revoke?token=${settings.google_refresh_token}`, {
            method: 'POST',
          });
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('[google-calendar-manage] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
