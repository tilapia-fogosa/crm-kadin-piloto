
import { supabase } from "@/integrations/supabase/client";

export const validateSession = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      console.error('[CalendarOperations] Erro de sessão:', error);
      return null;
    }
    return session.access_token;
  } catch (error) {
    console.error('[CalendarOperations] Erro ao validar sessão:', error);
    return null;
  }
};
