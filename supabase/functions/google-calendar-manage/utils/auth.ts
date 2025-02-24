
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

  console.log('[auth] Token formato válido:', { bearer, hasToken: !!token });

  // Criar cliente com service role para operações no banco
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Criar cliente para validação do usuário
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  return { serviceClient, authClient };
};

export const validateUserAndSettings = async (clients: ReturnType<typeof getAuthenticatedClient>) => {
  console.log('[auth] Iniciando validação de usuário e configurações');
  
  try {
    // Usar cliente de autenticação para validar o usuário
    const { data: { user }, error: userError } = await clients.authClient.auth.getUser();
    
    if (userError) {
      console.error('[auth] Erro na autenticação:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('[auth] Usuário não encontrado');
      throw new Error('User not found');
    }
    
    console.log('[auth] Usuário autenticado com sucesso:', { userId: user.id });

    // Usar service client para operações no banco
    const { data: settings, error: settingsError } = await clients.serviceClient
      .from('user_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.error('[auth] Erro ao obter configurações:', settingsError);
      throw new Error(`Failed to fetch calendar settings: ${settingsError.message}`);
    }

    if (!settings) {
      console.error('[auth] Configurações não encontradas para usuário:', user.id);
      throw new Error('Calendar settings not found');
    }

    console.log('[auth] Configurações obtidas com sucesso:', { 
      userId: user.id,
      hasGoogleAccount: !!settings.google_account_email,
      syncEnabled: settings.sync_enabled,
      hasRefreshToken: !!