
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EffectiveContact } from "../types"
import { useCallback } from "react"

export function useEffectiveContact() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerEffectiveContact = useCallback(async (contact: EffectiveContact) => {
    try {
      console.log("Registering effective contact:", contact)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Get client's unit_id
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', contact.cardId)
        .single()

      if (clientError) throw clientError
      if (!clientData?.unit_id) throw new Error('Client has no unit_id')

      // CORREÇÃO: Salvando as observações no campo notes da atividade
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: contact.cardId,
          tipo_contato: contact.type,
          tipo_atividade: 'Contato Efetivo',
          notes: contact.notes || contact.observations, // CORREÇÃO: Priorizar notes, depois observations
          created_by: session.session.user.id,
          next_contact_date: contact.nextContactDate?.toISOString(),
          unit_id: clientData.unit_id,
          active: true
        })

      if (activityError) throw activityError

      // CORREÇÃO: Removida atualização do campo observations do cliente
      if (contact.nextContactDate) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({ 
            next_contact_date: contact.nextContactDate.toISOString()
          })
          .eq('id', contact.cardId)

        if (clientError) throw clientError
      }

      // Invalida Kanban e atividades para atualização instantânea
      await queryClient.invalidateQueries({ queryKey: ['infinite-clients'], refetchType: 'all' })
      await queryClient.refetchQueries({ queryKey: ['infinite-clients'], type: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['activities', contact.cardId] })

      // Toast de sucesso removido
    } catch (error) {
      console.error('Error registering effective contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar contato efetivo",
        description: "Ocorreu um erro ao tentar registrar o contato efetivo.",
      })
    }
  }, [toast, queryClient])

  return { registerEffectiveContact }
}
