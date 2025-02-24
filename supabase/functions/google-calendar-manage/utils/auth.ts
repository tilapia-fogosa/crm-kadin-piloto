
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const getAuthenticatedClient = (authHeader: string | null) => {
  console.log('[auth] Verificando header de autorização');
  if (!authHeader) {
    console.error('[auth] Header de autorização ausente');
    throw new Error('Missing Authorization header');
  }

  // Validar formato do token (Bearer + string)
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    console.error('[auth] Formato de token inválido');
    throw new Error('Invalid token format');
  }

  console.log('[auth] Token validado, criando cliente Supabase');
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
  console.log('[auth] Iniciando validação de usuário e configurações');
  
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error('[auth] Erro na autenticação:', userError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      console.error('[auth] Usuário não encontrado');
      throw new Error('User not found');
    }
    
    console.log('[auth] Usuário autenticado:', { userId: user.id });

    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.error('[auth] Erro ao obter configurações:', settingsError);
      throw new Error('Failed to fetch calendar settings');
    }

    if (!settings) {
      console.error('[auth] Configurações não encontradas');
      throw new Error('Calendar settings not found');
    }

    console.log('[auth] Configurações obtidas com sucesso:', { 
      hasGoogleAccount: !!settings.google_account_email,
      syncEnabled: settings.sync_enabled,
      hasRefreshToken: !!settings.google_refresh_token
    });

    return { user, settings };
  } catch (error) {
    console.error('[auth] Erro na validação:', error);
    throw error;
  }
};

export const getAccessToken = async (supabaseClient: any, userId: string) => {
  console.log('[auth] Iniciando obtenção de access token');
  
  try {
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_calendar_settings')
      .select('google_refresh_token, sync_enabled')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('[auth] Erro ao obter configurações:', settingsError);
      throw new Error('Failed to fetch refresh token');
    }

    if (!settings?.google_refresh_token) {
      console.error('[auth] Token de atualização não encontrado');
      throw new Error('Google Calendar not connected');
    }

    if (!settings.sync_enabled) {
      console.error('[auth] Sincronização está desabilitada');
      throw new Error('Calendar sync is disabled');
    }

    console.log('[auth] Solicitando novo access token do Google');
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

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[auth] Erro ao obter access token:', errorData);
      throw new Error('Failed to refresh Google access token');
    }

    const tokenData = await tokenResponse.json();
    console.log('[auth] Novo access token obtido com sucesso');
    
    return tokenData.access_token;
  } catch (error) {
    console.error('[auth] Erro ao obter access token:', error);
    throw error;
  }
};
