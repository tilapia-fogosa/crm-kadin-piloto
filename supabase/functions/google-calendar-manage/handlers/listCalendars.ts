
import { CALENDAR_API_URL } from '../constants.ts';

export const listCalendars = async (accessToken: string) => {
  console.log('[listCalendars] Iniciando requisição para o Google Calendar API');
  
  const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
  
  return { calendars: calData.items };
};
