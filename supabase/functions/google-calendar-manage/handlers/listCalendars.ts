
import { CALENDAR_API_URL } from '../constants.ts';

export const listCalendars = async (accessToken: string) => {
  const calResponse = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!calResponse.ok) {
    throw new Error(`Failed to fetch calendars: ${await calResponse.text()}`);
  }

  const calData = await calResponse.json();
  return { calendars: calData.items };
};
