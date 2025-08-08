
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

      // Get client's unit_id
      const { data: clientData, error: fetchClientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', attempt.cardId)
        .single()

      if (fetchClientError) throw fetchClientError
      if (!clientData?.unit_id) throw new Error('Client has no unit_id')

      // Registra a atividade de tentativa de contato
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          tipo_contato: attempt.type,
          tipo_atividade: 'Tentativa de Contato',
          created_by: session.session.user.id,
          next_contact_date: attempt.nextContactDate.toISOString(),
          unit_id: clientData.unit_id,
          active: true,
          notes: attempt.notes // Salvando as notas no banco de dados
        })

      if (activityError) throw activityError

      // Atualiza o próximo contato do cliente
      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          next_contact_date: attempt.nextContactDate.toISOString(),
        })
        .eq('id', attempt.cardId)

      if (updateClientError) throw updateClientError

      // Invalida Kanban e atividades para atualização instantânea
      await queryClient.invalidateQueries({ queryKey: ['infinite-clients'], refetchType: 'all' })
      await queryClient.refetchQueries({ queryKey: ['infinite-clients'], type: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['activities', attempt.cardId] })

      // Toast de sucesso removido
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
