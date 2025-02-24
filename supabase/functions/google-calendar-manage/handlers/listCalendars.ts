
import { CALENDAR_API_URL } from '../constants.ts';
import { getAuthenticatedClient, validateUserAndSettings, getAccessToken } from '../utils/auth.ts';
import { corsHeaders } from '../utils/cors.ts';

export const listCalendars = async (req: Request) => {
  try {
    console.log('[listCalendars] Iniciando listagem de calendários');
    
    // Get auth header and create clients
    const authHeader = req.headers.get('Authorization');
    const clients = getAuthenticatedClient(authHeader);
    
    // Validate user and get settings
    const { user, settings } = await validateUserAndSettings(clients);
    console.log('[listCalendars] Usuário validado:', user.id);
    
    if (!settings.sync_enabled) {
      console.log('[listCalendars] Sincronização desabilitada para usuário:', user.id);
      return new Response(
        JSON.stringify({ calendars: [] }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get Google access token
    const googleToken = await getAccessToken(clients, user.id);
    console.log('[listCalendars] Token do Google obtido com sucesso');
    
    // Use Google token to fetch calendars
    const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
      headers: {
        'Authorization': `Bearer ${googleToken}`,
      },
    });

    if (!calResponse.ok) {
      const errorText = await calResponse.text();
      console.error('[listCalendars] Falha ao buscar calendários:', {
        status: calResponse.status,
        error: errorText
      });
      throw new Error(`Failed to fetch calendars: ${errorText}`);
    }

    const calData = await calResponse.json();
    console.log('[listCalendars] Calendários obtidos com sucesso:', {
      count: calData.items?.length
    });
    
    return new Response(
      JSON.stringify({ calendars: calData.items }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('[listCalendars] Erro:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};
