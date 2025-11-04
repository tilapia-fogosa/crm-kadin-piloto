/**
 * LOG: Hook para agendar aula inaugural via Edge Function
 * Envia dados para webhook N8N que persiste via API externa
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgendarAulaInauguralData {
  activity_id: string;
  full_name: string;
  data_aula_inaugural: string; // ISO date string (YYYY-MM-DD)
  horario_inicio: string; // HH:MM
  professor_id: string;
  professor_nome: string;
}

export function useAgendarAulaInaugural() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AgendarAulaInauguralData) => {
      console.log('LOG: Agendando aula inaugural via Edge Function:', data);
      
      // Chamar edge function
      const { data: result, error } = await supabase.functions.invoke(
        'agenda-aula-inaugural',
        { body: data }
      );
      
      if (error) {
        console.error('LOG: Erro ao chamar edge function:', error);
        throw error;
      }

      console.log('LOG: Resposta da edge function:', result);
      return result;
    },
    onSuccess: () => {
      console.log('LOG: Aula inaugural agendada com sucesso');
      
      // Invalidar cache relevante
      queryClient.invalidateQueries({ queryKey: ['pedagogical-data'] });
      queryClient.invalidateQueries({ queryKey: ['aula-inaugural-slots'] });
      queryClient.invalidateQueries({ queryKey: ['agenda-professores'] });
      queryClient.invalidateQueries({ queryKey: ['agenda-sala'] });
      
      toast.success('Aula inaugural agendada com sucesso!');
    },
    onError: (error) => {
      console.error('LOG: Erro ao agendar aula inaugural:', error);
      toast.error('Erro ao agendar aula inaugural. Tente novamente.');
    }
  });
}
