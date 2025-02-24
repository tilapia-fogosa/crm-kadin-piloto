
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
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 0);

        let nextSyncToken = null;
        const allEvents = [];
        const processedEventIds = new Set();

        for (const calendarId of calendars) {
          let apiUrl = `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?`;
          const params = new URLSearchParams({
            singleEvents: 'true',
            orderBy: 'updated',
            timeMin: threeMonthsAgo.toISOString(),
            timeMax: threeMonthsAhead.toISOString(),
          });

          if (syncToken) {
            params.set('syncToken', syncToken);
          }

          apiUrl += params.toString();
          console.log(`[google-calendar-manage] Fetching events for calendar ${calendarId}`);

          const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          
          if (!response.ok) {
            const error = await response.text();
            console.error('[google-calendar-manage] Error fetching events:', error);
            continue;
          }

          const data = await response.json();
          nextSyncToken = data.nextSyncToken;

          if (data.items) {
            // Processar eventos do Google Calendar
            for (const event of data.items) {
              if (event.status === 'cancelled') {
                // Marcar evento para remoção
                await supabaseClient
                  .from('calendar_events')
                  .delete()
                  .eq('google_event_id', event.id)
                  .eq('calendar_id', calendarId);
                continue;
              }

              // Verificar se é um evento válido com data
              if (!event.start?.dateTime || !event.end?.dateTime) {
                continue;
              }

              processedEventIds.add(event.id);

              const eventData = {
                user_id: userId,
                google_event_id: event.id,
                title: event.summary || 'Sem título',
                description: event.description,
                start_time: event.start.dateTime,
                end_time: event.end.dateTime,
                calendar_id: calendarId,
                calendar_name: event.organizer?.displayName,
                is_recurring: !!event.recurrence,
                recurring_rule: event.recurrence ? event.recurrence[0] : null,
                calendar_background_color: data.backgroundColor || '#4285f4',
                sync_status: 'synced',
                last_synced_at: new Date().toISOString()
              };

              // Upsert do evento
              const { error: upsertError } = await supabaseClient
                .from('calendar_events')
                .upsert({
                  ...eventData,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'google_event_id'
                });

              if (upsertError) {
                console.error('[google-calendar-manage] Error upserting event:', upsertError);
              }

              allEvents.push(eventData);
            }
          }
        }

        // Atualizar o sync_token e last_sync nas configurações
        const { error: updateError } = await supabaseClient
          .from('user_calendar_settings')
          .update({
            sync_token: nextSyncToken,
            last_sync: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[google-calendar-manage] Error updating sync token:', updateError);
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
