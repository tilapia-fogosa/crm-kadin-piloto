
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useGoogleCalendar() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const startGoogleAuth = async () => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { path: 'init' }
      });

      if (error) throw error;

      // Redirecionar para página de autenticação do Google
      window.location.href = data.url;

    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAuthCallback = async (code: string): Promise<boolean> => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          path: 'callback',
          code 
        }
      });

      if (error) throw error;

      toast({
        title: "Conexão realizada",
        description: "Google Calendar conectado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao processar callback:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível completar a conexão com o Google Calendar",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isConnecting,
    startGoogleAuth,
    handleAuthCallback
  };
}
