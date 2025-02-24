
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export const getAuthenticatedClient = (authHeader: string | null) => {
  console.log('[auth] Verificando header de autorização');
  if (!authHeader) {
    console.error('[auth] Header de autorização ausente');
    throw new Error('Missing Authorization header');
  }

  console.log('[auth] Criando cliente Supabase autenticado');
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
  console.log('[auth] Obtendo dados do usuário');
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
    console.error('[auth] Erro ao obter usuário:', userError);
    throw new Error('Usuário não autenticado');
  }
  console.log('[auth] Usuário encontrado:', { userId: user.id });

  console.log('[auth] Buscando configurações do calendário');
  const { data: settings, error: settingsError } = await supabaseClient
    .from('user_calendar_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (settingsError) {
    console.error('[auth] Erro ao obter configurações:', settingsError);
    throw new Error('Configurações do calendário não encontradas');
  }
  console.log('[auth] Configurações encontradas:', { 
    hasGoogleAccount: !!settings.google_account_email,
    syncEnabled: settings.sync_enabled,
    hasRefreshToken: !!settings.google_refresh_token
  });

  return { user, settings };
};

export const getAccessToken = async (supabaseClient: any, userId: string) => {
  console.log('[auth] Iniciando obtenção de access token');
  const { data: settings } = await supabaseClient
    .from('user_calendar_settings')
    .select('google_refresh_token, sync_enabled')
    .eq('user_id', userId)
    .single();

  if (!settings?.google_refresh_token) {
    console.error('[auth] Token de atualização não encontrado');
    throw new Error('Token de atualização não encontrado');
  }

  if (!settings.sync_enabled) {
    console.error('[auth] Sincronização está desabilitada');
    throw new Error('Sincronização está desabilitada');
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

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error('[auth] Falha ao atualizar access token:', tokenData);
    throw new Error('Falha ao atualizar o token de acesso');
  }

  console.log('[auth] Novo access token obtido com sucesso');
  return tokenData.access_token;
};
