
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useActivityDeletion() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteActivity = async (activityId: string, clientId: string) => {
    try {
      console.log('Iniciando processo de inativação:', { activityId, clientId });
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        console.error('Usuário não autenticado');
        throw new Error('Não autorizado: usuário não autenticado');
      }

      // Verifica se a atividade existe e está ativa
      const { data: existingActivity, error: checkError } = await supabase
        .from('client_activities')
        .select()
        .eq('id', activityId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar atividade:', checkError);
        throw checkError;
      }

      if (!existingActivity) {
        throw new Error('Atividade não encontrada');
      }

      console.log('Atividade encontrada:', existingActivity);

      // Usa uma transação única para atualizar a atividade
      const { data, error } = await supabase.rpc('inactivate_activity', {
        activity_id: activityId
      });

      if (error) {
        console.error('Erro ao inativar atividade:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Falha ao inativar atividade');
      }

      console.log('Resposta da inativação:', data);

      await queryClient.invalidateQueries({ queryKey: ['infinite-clients'], refetchType: 'all' })
      await queryClient.refetchQueries({ queryKey: ['infinite-clients'], type: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['activities', clientId] });

      // Toast de sucesso removido
    } catch (error) {
      console.error('Erro em deleteActivity:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar inativar a atividade.",
      })
      throw error;
    }
  }

  return { deleteActivity }
}
