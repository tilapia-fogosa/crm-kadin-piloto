
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from './utils/cors.ts';
import { getAuthenticatedClient, getAccessToken } from './utils/auth.ts';
import { listCalendars } from './handlers/listCalendars.ts';
import { syncEvents } from './handlers/syncEvents.ts';
import { revokeAccess } from './handlers/revokeAccess.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { path, calendars, syncToken } = await req.json();
    const supabaseClient = getAuthenticatedClient(req.headers.get('Authorization'));
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not found');

    const accessToken = await getAccessToken(supabaseClient, user.id);

    let response;
    switch (path) {
      case 'list-calendars':
        response = await listCalendars(accessToken);
        break;

      case 'sync-events':
        response = await syncEvents(accessToken, calendars, syncToken, supabaseClient, user.id);
        break;

      case 'revoke-access':
        const { data: settings } = await supabaseClient
          .from('user_calendar_settings')
          .select('google_refresh_token')
          .eq('user_id', user.id)
          .single();

        if (!settings?.google_refresh_token) {
          throw new Error('No refresh token to revoke');
        }

        response = await revokeAccess(settings.google_refresh_token);
        break;

      default:
        throw new Error(`Unknown path: ${path}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[google-calendar-manage] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
