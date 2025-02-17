
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

      // Tenta inativar a atividade usando a função do banco de dados
      const { data, error } = await supabase
        .from('client_activities')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .eq('active', true) // Adiciona condição para garantir que só atualiza se estiver ativa

      if (error) {
        console.error('Erro ao inativar atividade:', error);
        throw error;
      }

      console.log('Resposta da atualização:', data);

      // Força a revalidação dos dados do cliente
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
      throw error; // Re-throw para que o erro possa ser tratado pelo chamador se necessário
    }
  }

  return { deleteActivity }
}
