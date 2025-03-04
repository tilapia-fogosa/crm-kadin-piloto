
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ContactAttempt } from "../types"

export function useContactAttempt() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerAttempt = async (attempt: ContactAttempt) => {
    try {
      console.log("Registrando tentativa de contato:", attempt)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Não autenticado')

      // Registra a atividade de tentativa de contato
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          tipo_contato: attempt.type,
          tipo_atividade: 'Tentativa de Contato',
          created_by: session.session.user.id,
          next_contact_date: attempt.nextContactDate.toISOString(),
          active: true
        })

      if (activityError) throw activityError

      // Atualiza o próximo contato do cliente
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          next_contact_date: attempt.nextContactDate.toISOString(),
        })
        .eq('id', attempt.cardId)

      if (clientError) throw clientError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Tentativa registrada",
        description: "A atividade foi registrada com sucesso",
      })
    } catch (error) {
      console.error('Erro ao registrar tentativa:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar tentativa",
        description: "Ocorreu um erro ao tentar registrar a tentativa de contato.",
      })
      throw error
    }
  }

  return { registerAttempt }
}
