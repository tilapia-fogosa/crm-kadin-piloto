
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { EffectiveContact } from "../types"

export function useEffectiveContact() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerEffectiveContact = async (contact: EffectiveContact) => {
    try {
      console.log("Registering effective contact:", contact)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: contact.cardId,
          tipo_contato: contact.type,
          tipo_atividade: 'Contato Efetivo',
          notes: contact.notes,
          created_by: session.session.user.id,
          next_contact_date: contact.nextContactDate?.toISOString(),
          active: true
        })

      if (activityError) throw activityError

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

  return { registerEffectiveContact }
}
