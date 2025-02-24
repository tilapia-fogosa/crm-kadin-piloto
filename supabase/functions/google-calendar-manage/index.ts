
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body and validate path
    const { path } = await req.json();
    if (!path) throw new Error('Path is required');

    // Get JWT token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Error('Invalid user token');

    // Get user's Google refresh token
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_calendar_settings')
      .select('google_refresh_token')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.google_refresh_token) {
      throw new Error('Google Calendar not connected');
    }

    // Get new access token from Google
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
        refresh_token: settings.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token response:', await tokenResponse.text());
      throw new Error('Failed to get Google access token');
    }

    const { access_token } = await tokenResponse.json();
    if (!access_token) throw new Error('No access token received');

    // Handle different paths
    switch (path) {
      case 'list-calendars': {
        console.log('Fetching calendars list');
        const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
          headers: { 'Authorization': `Bearer ${access_token}` },
        });

        if (!calResponse.ok) {
          console.error('Calendar response:', await calResponse.text());
          throw new Error('Failed to fetch calendars');
        }

        const calendars = await calResponse.json();
        return new Response(JSON.stringify({ calendars: calendars.items }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
