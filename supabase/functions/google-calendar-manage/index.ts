
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

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

    // Obter configurações do usuário
    const { data: settings } = await supabaseClient
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .single();

    if (!settings?.google_refresh_token) {
      throw new Error('No refresh token found');
    }

    // Obter novo access token usando refresh token
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
      throw new Error('Failed to refresh access token');
    }

    const access_token = tokenData.access_token;

    switch (path) {
      case 'list-calendars': {
        console.log('Listing calendars...');
        const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = await response.json();
        return new Response(JSON.stringify({ calendars: data.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync-events': {
        console.log('Syncing events...');
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 0);

        let nextSyncToken = null;
        const processedEvents = new Set();
        const allEvents = [];

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
          console.log(`Fetching events for calendar ${calendarId}`);

          const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const data = await response.json();
          
          if (data.error) {
            console.error('Error fetching events:', data.error);
            continue;
          }

          nextSyncToken = data.nextSyncToken;
          if (data.items) {
            allEvents.push(...data.items);
          }
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
        console.log('Revoking access...');
        // Revogar o token de acesso atual
        await fetch(`${GOOGLE_OAUTH_API}/revoke?token=${access_token}`, {
          method: 'POST',
        });

        // Revogar o refresh token
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
