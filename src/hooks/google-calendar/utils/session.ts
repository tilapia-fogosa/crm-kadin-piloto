
import { supabase } from "@/integrations/supabase/client";

export const validateSession = async (): Promise<string | null> => {
  try {
    console.log('[Session] Iniciando validação de sessão');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Session] Erro ao obter sessão:', error);
      return null;
    }

    if (!session) {
      console.error('[Session] Sessão não encontrada');
      return null;
    }

    // Alterado para usar o token JWT para Edge Functions
    console.log('[Session] Verificando token de autorização');
    if (!session.access_token) {
      console.error('[Session] Token de autorização não encontrado na sessão');
      return null;
    }

    console.log('[Session] Sessão validada com sucesso:', {
      hasAccessToken: !!session.access_token,
      tokenType: typeof session.access_token
    });
    
    return session.access_token;
  } catch (error) {
    console.error('[Session] Erro ao validar sessão:', error);
    return null;
  }
};
