
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

      // Usamos a unitId fornecida no agendamento
      const unitId = scheduling.unitId;
      console.log('useScheduling - Usando unitId do agendamento:', unitId);
      
      if (!unitId) {
        throw new Error('Agendamento sem unitId definida');
      }

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
          unit_id: unitId,
          active: true
        })

      if (activityError) throw activityError

      // Atualiza dados do cliente, incluindo valorization_confirmed como false
      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString(),
          valorization_confirmed: false // Adicionando reset do status de valorização
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
