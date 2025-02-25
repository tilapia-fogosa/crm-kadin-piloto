
import { getAuthenticatedClient, validateUserAndSettings, getAccessToken } from './auth.ts';

interface GoogleClientConfig {
  url: string;
  method?: string;
  params?: Record<string, string>;
  body?: unknown;
}

// Cliente tipado para operações do Google Calendar
export interface GoogleClient {
  request: (config: GoogleClientConfig) => Promise<any>;
}

export const getGoogleClient = async (authHeader: string | null): Promise<GoogleClient> => {
  console.log('[GoogleClient] Iniciando criação do cliente');

  try {
    // 1. Validar autenticação e obter clients do Supabase
    const clients = getAuthenticatedClient(authHeader);
    console.log('[GoogleClient] Cliente Supabase autenticado');

    // 2. Validar usuário e configurações
    const { user, settings } = await validateUserAndSettings(clients);
    console.log('[GoogleClient] Usuário e configurações validados:', { userId: user.id });

    // 3. Obter token de acesso
    const accessToken = await getAccessToken(clients, user.id);
    console.log('[GoogleClient] Token de acesso obtido');

    // 4. Retornar cliente configurado
    return {
      request: async (config: GoogleClientConfig) => {
        const { url, method = 'GET', params, body } = config;

        // Construir URL com parâmetros
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const fullUrl = `${url}${queryParams ? `?${queryParams}` : ''}`;

        console.log(`[GoogleClient] Fazendo requisição ${method} para: ${url}`);

        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          ...(body ? { body: JSON.stringify(body) } : {})
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[GoogleClient] Erro na requisição:', {
            status: response.status,
            error: errorData
          });
          throw new Error(`Google API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('[GoogleClient] Resposta recebida com sucesso');
        return data;
      }
    };
  } catch (error) {
    console.error('[GoogleClient] Erro ao criar cliente:', error);
    throw error;
  }
};
