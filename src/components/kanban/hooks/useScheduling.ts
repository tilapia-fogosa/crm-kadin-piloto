
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Scheduling } from "../types"

export function useScheduling() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerScheduling = async (scheduling: Scheduling) => {
    try {
      console.log("Registering scheduling:", scheduling)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Get client's unit_id
      const { data: clientData, error: fetchClientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', scheduling.cardId)
        .single()

      if (fetchClientError) throw fetchClientError
      if (!clientData?.unit_id) throw new Error('Client has no unit_id')

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
          unit_id: clientData.unit_id,
          active: true
        })

      if (activityError) throw activityError

      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString()
        })
        .eq('id', scheduling.cardId)

      if (updateClientError) throw updateClientError

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

  return { registerScheduling }
}
