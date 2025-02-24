
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const getAuthenticatedClient = (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
};

export const getAccessToken = async (supabaseClient: any, userId: string) => {
  const { data: settings } = await supabaseClient
    .from('user_calendar_settings')
    .select('google_refresh_token')
    .eq('user_id', userId)
    .single();

  if (!settings?.google_refresh_token) {
    throw new Error('No refresh token found');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: settings.google_refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Failed to refresh token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
};
