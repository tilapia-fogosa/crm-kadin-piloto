import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ContactAttempt, EffectiveContact, Scheduling } from "../types"

export function useActivityOperations() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerAttempt = async (attempt: ContactAttempt) => {
    try {
      console.log("Registering attempt:", attempt)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          tipo_contato: attempt.type,
          tipo_atividade: 'Tentativa de Contato',
          created_by: session.session.user.id,
          next_contact_date: attempt.nextContactDate.toISOString()
        })

      if (activityError) throw activityError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Tentativa registrada",
        description: "A atividade foi registrada com sucesso",
      })
    } catch (error) {
      console.error('Error registering attempt:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar tentativa",
        description: "Ocorreu um erro ao tentar registrar a tentativa de contato.",
      })
    }
  }

  const registerEffectiveContact = async (contact: EffectiveContact) => {
    try {
      console.log("Registering effective contact:", contact)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Primeiro registra a atividade
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: contact.cardId,
          tipo_contato: contact.type,
          tipo_atividade: 'Contato Efetivo',
          notes: contact.notes,
          created_by: session.session.user.id,
          next_contact_date: contact.nextContactDate?.toISOString()
        })

      if (activityError) throw activityError

      // Atualiza o cliente diretamente com a nova data de contato
      if (contact.nextContactDate) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({ 
            next_contact_date: contact.nextContactDate.toISOString(),
            observations: contact.observations 
          })
          .eq('id', contact.cardId)

        if (clientError) throw clientError
      }

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Contato efetivo registrado",
        description: "A atividade foi registrada com sucesso",
      })
    } catch (error) {
      console.error('Error registering effective contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar contato efetivo",
        description: "Ocorreu um erro ao tentar registrar o contato efetivo.",
      })
    }
  }

  const registerScheduling = async (scheduling: Scheduling) => {
    try {
      console.log("Registering scheduling:", scheduling)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: scheduling.cardId,
          tipo_atividade: 'Agendamento',
          notes: scheduling.notes,
          tipo_contato: 'phone', // Valor padrão necessário
          created_by: session.session.user.id,
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString() // Será undefined se valorizacaoDiaAnterior for false
        })

      if (activityError) throw activityError

      // Atualiza o scheduled_date do cliente
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString() // Atualiza apenas se valorizacaoDiaAnterior for true
        })
        .eq('id', scheduling.cardId)

      if (clientError) throw clientError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Agendamento registrado",
        description: "O agendamento foi registrado com sucesso",
      })
    } catch (error) {
      console.error('Error registering scheduling:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar agendamento",
        description: "Ocorreu um erro ao tentar registrar o agendamento.",
      })
    }
  }

  const deleteActivity = async (activityId: string, clientId: string) => {
    try {
      console.log('Deleting activity:', { activityId, clientId })
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Excluir a atividade - o trigger se encarregará de mover para deleted_activities
      const { error: deleteError } = await supabase
        .from('client_activities')
        .delete()
        .eq('id', activityId)

      if (deleteError) {
        console.error('Error deleting activity:', deleteError)
        throw deleteError
      }

      // Atualizar a query cache para refletir a mudança
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso",
      })
    } catch (error) {
      console.error('Error in deleteActivity:', error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: "Ocorreu um erro ao tentar excluir a atividade.",
      })
      throw error
    }
  }

  return {
    registerAttempt,
    registerEffectiveContact,
    registerScheduling,
    deleteActivity
  }
}
