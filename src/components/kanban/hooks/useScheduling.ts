
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

      // Use the unitId provided in the scheduling
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

      // Update client data, including valorization_confirmed as false
      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: scheduling.scheduledDate.toISOString(),
          next_contact_date: scheduling.nextContactDate?.toISOString(),
          valorization_confirmed: false // Reset valorization status
        })
        .eq('id', scheduling.cardId)

      if (updateClientError) throw updateClientError

      // Enviar webhook para agendamento (não bloqueia se falhar)
      try {
        console.log('📤 [useScheduling] Enviando webhook para agendamento')
        await supabase.functions.invoke('activity-webhook', {
          body: {
            activity_id: 'temp-id', // Será substituído pela Edge Function
            client_id: scheduling.cardId,
            tipo_atividade: 'Agendamento',
            tipo_contato: scheduling.type,
            scheduled_date: scheduling.scheduledDate.toISOString(),
            notes: scheduling.notes,
            unit_id: unitId,
            created_by: session.session.user.id
          }
        })
        console.log('✅ [useScheduling] Webhook enviado com sucesso')
      } catch (webhookError) {
        console.warn('⚠️ [useScheduling] Falha no webhook (não bloqueante):', webhookError)
      }

      // Invalida tanto o cache geral quanto o específico das atividades
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await queryClient.invalidateQueries({ queryKey: ['activities', scheduling.cardId] })

      // Toast de sucesso removido
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
