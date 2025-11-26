/**
 * Hook para verificar status da conexão WhatsApp
 * 
 * Log: Hook personalizado que verifica status da conexão do WhatsApp
 * Etapas:
 * 1. Busca registro com indice = 16 da tabela dados_importantes
 * 2. Verifica se o campo valor é diferente de "open"
 * 3. Atualiza a cada 30 segundos para monitorar status
 * 4. Retorna se está desconectado
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWhatsappStatus() {
  console.log('useWhatsappStatus: Verificando status da conexão WhatsApp');

  return useQuery({
    queryKey: ['whatsapp-connection-status'],
    refetchInterval: 30000, // Verifica a cada 30 segundos
    queryFn: async () => {
      console.log('useWhatsappStatus: Buscando status na tabela dados_importantes');

      const { data, error } = await supabase
        .from('dados_importantes')
        .select('data')
        .eq('id', 16)
        .single();

      if (error) {
        console.error('useWhatsappStatus: Erro ao buscar status:', error);
        // Em caso de erro, assumir que está desconectado por segurança
        return { isDisconnected: true };
      }

      const isDisconnected = data?.data !== 'open';
      console.log('useWhatsappStatus: Status da conexão:', {
        valor: data?.data,
        isDisconnected
      });

      return { isDisconnected };
    }
  });
}
