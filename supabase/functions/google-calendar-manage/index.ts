
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from './utils/cors.ts';
import { getAuthenticatedClient, getAccessToken, validateUserAndSettings } from './utils/auth.ts';
import { listCalendars } from './handlers/listCalendars.ts';
import { syncEvents } from './handlers/syncEvents.ts';
import { revokeAccess } from './handlers/revokeAccess.ts';

serve(async (req) => {
  const startTime = Date.now();
  console.log('[google-calendar-manage] Iniciando requisição');

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('[google-calendar-manage] Processando corpo da requisição');
    const { path, calendars, syncToken } = await req.json();
    console.log('[google-calendar-manage] Parâmetros recebidos:', { path, hasCalendars: !!calendars, hasSyncToken: !!syncToken });

    console.log('[google-calendar-manage] Autenticando cliente Supabase');
    const supabaseClient = getAuthenticatedClient(req.headers.get('Authorization'));
    
    console.log('[google-calendar-manage] Validando usuário e configurações');
    const { user, settings } = await validateUserAndSettings(supabaseClient);
    console.log('[google-calendar-manage] Usuário validado:', { 
      userId: user.id,
      hasGoogleEmail: !!settings.google_account_email,
      syncEnabled: settings.sync_enabled
    });

    let response;
    switch (path) {
      case 'list-calendars':
        console.log('[google-calendar-manage] Iniciando listagem de calendários');
        const accessToken = await getAccessToken(supabaseClient, user.id);
        response = await listCalendars(accessToken);
        console.log('[google-calendar-manage] Calendários listados com sucesso:', { 
          count: response.calendars?.length 
        });
        break;

      case 'sync-events':
        if (!settings.sync_enabled) {
          console.log('[google-calendar-manage] Sincronização desabilitada para o usuário');
          throw new Error('Sincronização está desabilitada');
        }
        console.log('[google-calendar-manage] Iniciando sincronização de eventos');
        const syncAccessToken = await getAccessToken(supabaseClient, user.id);
        response = await syncEvents(syncAccessToken, calendars, syncToken, supabaseClient, user.id);
        console.log('[google-calendar-manage] Eventos sincronizados com sucesso:', { 
          eventCount: response.events?.length,
          hasSyncToken: !!response.nextSyncToken
        });
        break;

      case 'revoke-access':
        console.log('[google-calendar-manage] Iniciando revogação de acesso');
        if (!settings.google_refresh_token) {
          console.log('[google-calendar-manage] Nenhum token para revogar');
          throw new Error('Nenhum token para revogar');
        }
        response = await revokeAccess(settings.google_refresh_token);
        console.log('[google-calendar-manage] Acesso revogado com sucesso');
        break;

      default:
        console.error('[google-calendar-manage] Operação desconhecida:', path);
        throw new Error(`Operação desconhecida: ${path}`);
    }

    const executionTime = Date.now() - startTime;
    console.log('[google-calendar-manage] Operação concluída com sucesso:', { 
      path, 
      executionTimeMs: executionTime 
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[google-calendar-manage] Erro na execução:', {
      error: error.message,
      stack: error.stack,
      executionTimeMs: Date.now() - startTime
    });
    
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
