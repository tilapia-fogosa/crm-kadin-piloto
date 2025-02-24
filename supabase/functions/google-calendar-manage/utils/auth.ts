
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

export const validateUserAndSettings = async (supabaseClient: any) => {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting user:', userError);
    throw new Error('Usuário não autenticado');
  }

  // Verifica se as configurações do usuário existem e estão válidas
  const { data: settings, error: settingsError } = await supabaseClient
    .from('user_calendar_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (settingsError) {
    console.error('Error getting settings:', settingsError);
    throw new Error('Configurações do calendário não encontradas');
  }

  return { user, settings };
};

export const getAccessToken = async (supabaseClient: any, userId: string) => {
  const { data: settings } = await supabaseClient
    .from('user_calendar_settings')
    .select('google_refresh_token, sync_enabled')
    .eq('user_id', userId)
    .single();

  if (!settings?.google_refresh_token) {
    throw new Error('Token de atualização não encontrado');
  }

  if (!settings.sync_enabled) {
    throw new Error('Sincronização está desabilitada');
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
    console.error('Token refresh failed:', tokenData);
    throw new Error('Falha ao atualizar o token de acesso');
  }

  return tokenData.access_token;
};
