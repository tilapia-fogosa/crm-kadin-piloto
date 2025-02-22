
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

  return {
    isConnecting,
    startGoogleAuth
  };
}
