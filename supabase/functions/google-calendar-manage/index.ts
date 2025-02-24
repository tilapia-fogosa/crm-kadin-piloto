
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { listCalendars } from "./handlers/listCalendars.ts";
import { syncEvents } from "./handlers/syncEvents.ts";
import { revokeAccess } from "./handlers/revokeAccess.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { path, ...body } = await req.json();

    // Log para debug
    console.log('[google-calendar-manage] Request recebido:', {
      path,
      hasAuth: !!req.headers.get('Authorization')
    });

    // Route request based on path
    switch (path) {
      case 'list-calendars':
        return await listCalendars(req);
      case 'sync-events':
        return await syncEvents(req);
      case 'revoke-access':
        return await revokeAccess(req);
      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('[google-calendar-manage] Erro:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
