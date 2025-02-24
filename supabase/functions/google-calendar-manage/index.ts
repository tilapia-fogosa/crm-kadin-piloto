
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from './utils/cors.ts';
import { getAuthenticatedClient, getAccessToken, validateUserAndSettings } from './utils/auth.ts';
import { listCalendars } from './handlers/listCalendars.ts';
import { syncEvents } from './handlers/syncEvents.ts';
import { revokeAccess } from './handlers/revokeAccess.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { path, calendars, syncToken } = await req.json();
    const supabaseClient = getAuthenticatedClient(req.headers.get('Authorization'));
    
    // Validação robusta do usuário e configurações
    const { user, settings } = await validateUserAndSettings(supabaseClient);

    let response;
    switch (path) {
      case 'list-calendars':
        // Lista calendários mesmo se a sincronização estiver desabilitada
        const accessToken = await getAccessToken(supabaseClient, user.id);
        response = await listCalendars(accessToken);
        break;

      case 'sync-events':
        if (!settings.sync_enabled) {
          throw new Error('Sincronização está desabilitada');
        }
        const syncAccessToken = await getAccessToken(supabaseClient, user.id);
        response = await syncEvents(syncAccessToken, calendars, syncToken, supabaseClient, user.id);
        break;

      case 'revoke-access':
        if (!settings.google_refresh_token) {
          throw new Error('Nenhum token para revogar');
        }
        response = await revokeAccess(settings.google_refresh_token);
        break;

      default:
        throw new Error(`Operação desconhecida: ${path}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[google-calendar-manage] Error:', error);
    
    // Mensagens de erro mais amigáveis
    const userMessage = error.message.includes('token')
      ? 'Erro de autenticação. Por favor, reconecte sua conta do Google Calendar.'
      : error.message;

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
