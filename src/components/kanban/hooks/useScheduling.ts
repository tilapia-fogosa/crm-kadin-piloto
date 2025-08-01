
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

      // Get client's current scheduled_date to detect change type
      const { data: clientData, error: fetchClientError } = await supabase
        .from('clients')
        .select('scheduled_date')
        .eq('id', scheduling.cardId)
        .single()

      if (fetchClientError) throw fetchClientError
      
      const scheduledDateAnterior = clientData?.scheduled_date

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

      // Enviar webhook ÚNICO com todas as informações (não bloqueia se falhar)
      try {
        const novaScheduledDate = scheduling.scheduledDate.toISOString()
        const tipoMudanca = scheduledDateAnterior ? 'reagendamento' : 'agendamento_criado'
        
        console.log('📤 [useScheduling] Enviando webhook único com informações completas:', {
          activity_id: 'temp-id',
          client_id: scheduling.cardId,
          tipo_atividade: 'Agendamento',
          tipo_contato: scheduling.type,
          scheduled_date: novaScheduledDate,
          notes: scheduling.notes,
          unit_id: unitId,
          created_by: session.session.user.id,
          operacao: 'criado',
          scheduled_date_anterior: scheduledDateAnterior,
          tipo_mudanca_agendamento: tipoMudanca
        })
        
        const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('activity-webhook', {
          body: {
            activity_id: 'temp-id', // Será substituído pela Edge Function
            client_id: scheduling.cardId,
            tipo_atividade: 'Agendamento',
            tipo_contato: scheduling.type,
            scheduled_date: novaScheduledDate,
            notes: scheduling.notes,
            unit_id: unitId,
            created_by: session.session.user.id,
            operacao: 'criado',
            // Campos adicionais de mudança de agendamento
            scheduled_date_anterior: scheduledDateAnterior,
            tipo_mudanca_agendamento: tipoMudanca
          }
        })
        
        if (webhookError) {
          console.error('❌ [useScheduling] Erro no webhook:', webhookError)
        } else {
          console.log('✅ [useScheduling] Webhook único enviado com sucesso:', webhookResponse)
        }
      } catch (webhookError) {
        console.error('⚠️ [useScheduling] Falha no webhook (não bloqueante):', webhookError)
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
