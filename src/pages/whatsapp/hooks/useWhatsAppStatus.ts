/**
 * Hook para buscar status da conexão WhatsApp
 * 
 * Log: Hook que busca o status da conexão na tabela dados_importantes
 * Etapas:
 * 1. Busca o registro com key = 'status_whatapp_comercial'
 * 2. Mapeia os valores: open → Conectado, connecting → Conectando, close → Desconectado
 * 3. Retorna o status formatado e o valor bruto
 * 4. Atualiza a cada 10 segundos
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type StatusValue = "open" | "connecting" | "close";

interface WhatsAppStatus {
  raw: StatusValue | null;
  label: string;
  color: "success" | "warning" | "destructive";
}

export function useWhatsAppStatus() {
  console.log('useWhatsAppStatus: Iniciando hook para buscar status');

  return useQuery({
    queryKey: ['whatsapp-status'],
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    queryFn: async (): Promise<WhatsAppStatus> => {
      console.log('useWhatsAppStatus: Buscando status na tabela dados_importantes');

      const { data, error } = await supabase
        .from('dados_importantes')
        .select('data')
        .eq('key', 'status_whatapp_comercial')
        .maybeSingle();

      if (error) {
        console.error('useWhatsAppStatus: Erro ao buscar status:', error);
        return {
          raw: null,
          label: 'Desconectado',
          color: 'destructive'
        };
      }

      if (!data) {
        console.warn('useWhatsAppStatus: Registro status_whatapp_comercial não encontrado na tabela dados_importantes');
        return {
          raw: null,
          label: 'Desconectado',
          color: 'destructive'
        };
      }

      const statusValue = data?.data as StatusValue;
      console.log('useWhatsAppStatus: Status recebido:', statusValue);

      // Mapear status para label e cor
      const statusMap: Record<StatusValue, { label: string; color: "success" | "warning" | "destructive" }> = {
        open: { label: 'Conectado', color: 'success' },
        connecting: { label: 'Conectando', color: 'warning' },
        close: { label: 'Desconectado', color: 'destructive' }
      };

      const mapped = statusMap[statusValue] || { label: 'Desconectado', color: 'destructive' };

      return {
        raw: statusValue,
        label: mapped.label,
        color: mapped.color
      };
    }
  });
}
