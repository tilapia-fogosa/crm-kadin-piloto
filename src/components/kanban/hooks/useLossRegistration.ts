
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useUserUnit } from "./useUserUnit"
import { useUnit } from "@/contexts/UnitContext"
import { sendActivityWebhookSafe, fetchClientData, getScheduleChangeType } from "../utils/webhookService"

interface LossRegistrationProps {
  clientId: string
  activityType: 'Tentativa de Contato' | 'Contato Efetivo'
  contactType: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial'
  reasons: string[]
  observations?: string
}

export function useLossRegistration() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  // Substituindo useUserUnit().currentUnitId por useUnit().selectedUnitId
  const { selectedUnitId } = useUnit()

  const registerLoss = async ({
    clientId,
    activityType,
    contactType,
    reasons,
    observations
  }: LossRegistrationProps) => {
    try {
      console.log('Iniciando registro de perda:', {
        clientId,
        activityType,
        reasons,
        observations
      })

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Não autenticado')

      // Buscar dados do cliente usando função centralizada
      const clientData = await fetchClientData(clientId)
      
      // Armazenando o status anterior do cliente e scheduled_date antes de ser marcado como perdido
      const previousStatus = clientData.status
      const scheduledDateAnterior = clientData.scheduled_date
      console.log(`Status anterior do cliente: ${previousStatus}`)
      console.log(`Scheduled date anterior: ${scheduledDateAnterior}`)

      // 1. Registra a atividade
      // CORREÇÃO: Usando o campo notes para as observações
      const { data: activity, error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: clientId,
          tipo_atividade: activityType,
          tipo_contato: contactType,
          notes: observations, // CORREÇÃO: Salvando no campo notes
          created_by: session.session.user.id,
          unit_id: clientData.unit_id,
          active: true
        })
        .select()
        .single()

      if (activityError) throw activityError

      // 2. Registra os motivos de perda com os novos campos
      console.log('Registrando motivos de perda:', reasons)
      const totalReasons = reasons.length
      
      if (reasons.length > 0) {
        const reasonEntries = reasons.map(reasonId => ({
          client_id: clientId,
          reason_id: reasonId,
          observations: observations,
          previous_status: previousStatus,
          total_reasons: totalReasons,
          created_by: session.session.user.id,
          unit_id: clientData.unit_id
        }))

        const { error: reasonsError } = await supabase
          .from('client_loss_reasons')
          .insert(reasonEntries)

        if (reasonsError) throw reasonsError
      }

      // 3. Atualiza o status do cliente para perdido E limpa a scheduled_date
      console.log('Atualizando status do cliente para perdido e limpando scheduled_date')
      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          status: 'perdido',
          scheduled_date: null, // NOVO: Limpa a data de agendamento
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)

      if (updateClientError) throw updateClientError

      // 4. Webhook removido - não envia mais para n8n ao registrar perda
      console.log('✅ [useLossRegistration] Perda registrada (webhook desabilitado)')

      // 5. Atualiza o cache do React Query
      await queryClient.invalidateQueries({ queryKey: ['infinite-clients'], refetchType: 'all' })
      await queryClient.refetchQueries({ queryKey: ['infinite-clients'], type: 'all' })

      console.log('Registro de perda concluído com sucesso')
      
      // Toast de sucesso removido
    } catch (error) {
      console.error('Erro ao registrar perda:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar perda",
        description: "Ocorreu um erro ao tentar registrar a perda do cliente."
      })
      return false
    }
  }

  return { registerLoss }
}
