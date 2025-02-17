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
          next_contact_date: attempt.nextContactDate.toISOString(),
          active: true // Garante que a nova atividade é criada como ativa
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
          next_contact_date: contact.nextContactDate?.toISOString(),
          active: true // Garante que a nova atividade é criada como ativa
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
          tipo_contato: scheduling.type,
          created_by: session.session.user.id,
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString(),
          active: true // Garante que a nova atividade é criada como ativa
        })

      if (activityError) throw activityError

      // Atualiza o scheduled_date do cliente
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString()
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
      console.log('Tentando inativar atividade:', { activityId, clientId })
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Executa a atualização diretamente
      const { error: updateError, data: updatedActivity } = await supabase
        .from('client_activities')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao inativar atividade:', updateError)
        throw updateError
      }

      console.log('Atividade inativada com sucesso:', updatedActivity)

      // Invalidar o cache para forçar recarregamento dos dados
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Atividade excluída",
        description: "A atividade foi inativada com sucesso",
      })
    } catch (error) {
      console.error('Erro em deleteActivity:', error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar inativar a atividade.",
      })
    }
  }

  return {
    registerAttempt,
    registerEffectiveContact,
    registerScheduling,
    deleteActivity
  }
}
