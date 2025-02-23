
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  recurringEventId?: string;
  originalStartTime?: { dateTime: string };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { path, calendars = [], syncToken = null } = await req.json();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    const { data: settings } = await supabaseClient
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .single();

    if (!settings?.google_refresh_token) {
      throw new Error('No refresh token found');
    }

    // Get new access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: settings.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const { access_token } = await tokenResponse.json();
    if (!access_token) throw new Error('Failed to get access token');

    switch (path) {
      case 'list-calendars': {
        const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = await response.json();
        return new Response(JSON.stringify({ calendars: data.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync-events': {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 0);

        let nextSyncToken = null;
        const processedEvents = new Set();

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

          const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const data = await response.json();
          nextSyncToken = data.nextSyncToken;

          // Process events
          const events = (data.items || []) as GoogleEvent[];
          for (const event of events) {
            if (processedEvents.has(event.id)) continue;
            processedEvents.add(event.id);

            // Skip cancelled events
            if (event.status === 'cancelled') {
              await supabaseClient
                .from('calendar_events')
                .delete()
                .match({ google_event_id: event.id, user_id: user.id });
              continue;
            }

            const calendarResponse = await fetch(
              `${GOOGLE_CALENDAR_API}/calendars/${calendarId}`,
              { headers: { Authorization: `Bearer ${access_token}` } }
            );
            const calendarData = await calendarResponse.json();

            const eventData = {
              user_id: user.id,
              google_event_id: event.id,
              title: event.summary,
              description: event.description,
              start_time: event.start.dateTime,
              end_time: event.end.dateTime,
              is_recurring: !!event.recurringEventId,
              calendar_id: calendarId,
              calendar_name: calendarData.summary,
              calendar_background_color: calendarData.backgroundColor,
              sync_status: 'synced',
              last_synced_at: new Date().toISOString(),
            };

            // Upsert event
            const { error: upsertError } = await supabaseClient
              .from('calendar_events')
              .upsert(eventData, {
                onConflict: 'google_event_id,user_id',
                ignoreDuplicates: false,
              });

            if (upsertError) {
              console.error('Error upserting event:', upsertError);
              throw upsertError;
            }
          }
        }

        return new Response(
          JSON.stringify({ success: true, nextSyncToken }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
