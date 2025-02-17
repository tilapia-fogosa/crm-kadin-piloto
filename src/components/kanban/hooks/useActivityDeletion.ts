
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
      
      // Verificar se a atividade existe e está ativa
      const { data: existingActivity, error: checkError } = await supabase
        .from('client_activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.error('Atividade não encontrada:', activityId);
          throw new Error('Atividade não encontrada');
        }
        console.error('Erro ao verificar atividade:', checkError);
        throw checkError;
      }

      if (!existingActivity) {
        console.error('Atividade não encontrada:', activityId);
        throw new Error('Atividade não encontrada');
      }

      console.log('Atividade encontrada:', existingActivity);

      // Executa a função de inativação diretamente usando a função do banco
      const { data: result, error: inactivateError } = await supabase
        .rpc('inactivate_activity', {
          activity_id: activityId
        });

      if (inactivateError) {
        console.error('Erro ao inativar atividade:', inactivateError);
        throw inactivateError;
      }

      if (!result) {
        throw new Error('Falha ao inativar atividade: operação não realizada');
      }

      console.log('Atividade inativada com sucesso');

      await queryClient.invalidateQueries({ queryKey: ['clients'] });

      toast({
        title: "Atividade excluída",
        description: "A atividade foi inativada com sucesso",
      })
    } catch (error) {
      console.error('Erro em deleteActivity:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar inativar a atividade.",
      })
    }
  }

  return { deleteActivity }
}
