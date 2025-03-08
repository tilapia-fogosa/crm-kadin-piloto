
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

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

      // Get client's unit_id
      const { data: clientData, error: fetchClientError } = await supabase
        .from('clients')
        .select('unit_id')
        .eq('id', clientId)
        .single()

      if (fetchClientError) throw fetchClientError
      if (!clientData?.unit_id) throw new Error('Client has no unit_id')

      // 1. Registra a atividade
      const { data: activity, error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: clientId,
          tipo_atividade: activityType,
          tipo_contato: contactType,
          notes: observations,
          created_by: session.session.user.id,
          unit_id: clientData.unit_id,
          active: true
        })
        .select()
        .single()

      if (activityError) throw activityError

      // 2. Registra os motivos de perda
      console.log('Registrando motivos de perda:', reasons)
      if (reasons.length > 0) {
        const reasonEntries = reasons.map(reasonId => ({
          client_id: clientId,
          reason_id: reasonId,
          observations: observations
        }))

        const { error: reasonsError } = await supabase
          .from('client_loss_reasons')
          .insert(reasonEntries)

        if (reasonsError) throw reasonsError
      }

      // 3. Atualiza o status do cliente para perdido
      console.log('Atualizando status do cliente para perdido')
      const { error: updateClientError } = await supabase
        .from('clients')
        .update({ 
          status: 'perdido',
          observations: observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)

      if (updateClientError) throw updateClientError

      // 4. Atualiza o cache do React Query
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      console.log('Registro de perda concluído com sucesso')
      toast({
        title: "Cliente marcado como perdido",
        description: "As informações foram registradas com sucesso."
      })

      return true
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
