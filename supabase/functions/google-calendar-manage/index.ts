
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Log para debug
    console.log('[google-calendar-manage] Headers recebidos:', {
      auth: !!authHeader,
      authType: typeof authHeader,
      authLength: authHeader?.length
    });

    // Create authenticated Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Log para debug da criação do cliente
    console.log('[google-calendar-manage] Cliente Supabase criado');

    // Route request based on path
    switch (path) {
      case 'list-calendars':
        return await listCalendars(supabase, body);
      case 'sync-events':
        return await syncEvents(supabase, body);
      case 'revoke-access':
        return await revokeAccess(supabase);
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
