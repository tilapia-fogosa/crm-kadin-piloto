
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from './utils/cors.ts';
import { syncCalendarEvents } from './handlers/syncEvents.ts';
import { listCalendars } from './handlers/listCalendars.ts';
import { revokeAccess } from './handlers/revokeAccess.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { path, ...body } = await req.json();
    console.log(`[EdgeFunction] Requisição recebida - Path: ${path}`);

    let result;

    switch (path) {
      case 'list-calendars': {
        result = await listCalendars(req);
        break;
      }

      case 'sync-events': {
        const { calendars, syncToken } = body;
        console.log('[EdgeFunction] Iniciando sincronização', { 
          userId: user.id,
          calendars,
          syncToken 
        });
        
        result = await syncCalendarEvents(req);
        break;
      }

      case 'revoke-access': {
        result = await revokeAccess(user.id);
        break;
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[EdgeFunction] Erro:', errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
