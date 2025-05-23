
import { useState } from "react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useDebounceSubmission } from "./useDebounceSubmission"
import { useQueryClient } from "@tanstack/react-query"

export function useAttendanceSubmission() {
  const { toast } = useToast()
  const { isProcessing, wrapSubmission } = useDebounceSubmission({ debounceMs: 2000 })
  const queryClient = useQueryClient()

  const submitAttendance = async ({
    cardId,
    result,
    qualityScore,
    selectedReasons,
    observations,
    nextContactDate,
    notes
  }: {
    cardId: string
    result: 'matriculado' | 'negociacao' | 'perdido'
    qualityScore?: string
    selectedReasons?: string[]
    observations?: string
    nextContactDate?: Date
    notes?: string
  }) => {
    return wrapSubmission(async () => {
      const submissionId = Math.random().toString(36).substring(7)
      console.log(`[${submissionId}] Iniciando submissão de atendimento:`, {
        cardId,
        result,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate,
        notes
      })

      try {
        // Get client's unit_id and current status
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('unit_id, status')
          .eq('id', cardId)
          .single()

        if (clientError) {
          console.error(`[${submissionId}] Erro ao buscar unit_id do cliente:`, clientError)
          throw clientError
        }
        if (!clientData?.unit_id) {
          console.error(`[${submissionId}] Cliente sem unit_id`)
          throw new Error('Client has no unit_id')
        }
        
        // Armazenando o status anterior do cliente
        const previousStatus = clientData.status
        console.log(`[${submissionId}] Status anterior do cliente: ${previousStatus}`)

        const session = (await supabase.auth.getSession()).data.session
        if (!session) {
          console.error(`[${submissionId}] Usuário não autenticado`)
          throw new Error('Not authenticated')
        }

        // Registra a atividade de Atendimento
        // CORREÇÃO: Usando o campo notes para armazenar as observações
        console.log(`[${submissionId}] Registrando atividade de atendimento com notes:`, notes || observations)
        const { data: attendanceActivity, error: attendanceError } = await supabase
          .from('client_activities')
          .insert({
            client_id: cardId,
            tipo_atividade: 'Atendimento',
            tipo_contato: 'presencial',
            notes: notes || observations || null, // CORREÇÃO: Usando notes como prioridade, depois observations
            unit_id: clientData.unit_id,
            created_by: session.user.id,
            active: true
          })
          .select()
          .single()

        if (attendanceError) {
          console.error(`[${submissionId}] Erro ao registrar atividade de atendimento:`, attendanceError)
          throw attendanceError
        }

        // Se for matriculado, registra atividade de Matrícula
        if (result === 'matriculado') {
          console.log(`[${submissionId}] Cliente matriculado, registrando atividade de matrícula`)
          
          const { error: matriculaError } = await supabase
            .from('client_activities')
            .insert({
              client_id: cardId,
              tipo_atividade: 'Matrícula',
              tipo_contato: 'presencial',
              created_by: session.user.id,
              unit_id: clientData.unit_id,
              notes: notes || observations || null, // CORREÇÃO: Usando notes como prioridade, depois observations
              active: true
            })

          if (matriculaError) {
            console.error(`[${submissionId}] Erro ao registrar atividade de matrícula:`, matriculaError)
            throw matriculaError
          }
        }

        // Se houver motivos de perda, registra-os com os novos campos
        if (result === 'perdido' && selectedReasons?.length) {
          console.log(`[${submissionId}] Registrando motivos de perda:`, selectedReasons)
          
          const totalReasons = selectedReasons.length
          const reasonEntries = selectedReasons.map(reasonId => ({
            client_id: cardId,
            reason_id: reasonId,
            observations: observations || null,
            previous_status: previousStatus,
            total_reasons: totalReasons,
            created_by: session.user.id,
            unit_id: clientData.unit_id
          }))

          const { error: reasonsError } = await supabase
            .from('client_loss_reasons')
            .insert(reasonEntries)

          if (reasonsError) {
            console.error(`[${submissionId}] Erro ao registrar motivos de perda:`, reasonsError)
            throw reasonsError
          }
        }

        // Atualiza o status do cliente e limpa o scheduled_date
        // CORREÇÃO: Removida a atualização do campo observations
        console.log(`[${submissionId}] Atualizando cliente - Limpando scheduled_date e atualizando status`)
        const updateData: any = {
          status: result,
          lead_quality_score: qualityScore ? parseInt(qualityScore) : null,
          next_contact_date: nextContactDate ? format(nextContactDate, 'yyyy-MM-dd') : null,
          scheduled_date: null, // Limpando o scheduled_date após o atendimento
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', cardId)

        if (updateError) {
          console.error(`[${submissionId}] Erro ao atualizar cliente:`, updateError)
          throw updateError
        }

        // Invalida tanto o cache geral quanto o específico das atividades
        await queryClient.invalidateQueries({ queryKey: ['clients'] })
        await queryClient.invalidateQueries({ queryKey: ['activities', cardId] })

        console.log(`[${submissionId}] Atendimento registrado com sucesso`)
        
        // Toast de sucesso removido

        return true
      } catch (error) {
        console.error(`[${submissionId}] Erro ao registrar atendimento:`, error)
        toast({
          variant: "destructive",
          title: "Erro ao registrar atendimento",
          description: "Ocorreu um erro ao tentar registrar o atendimento."
        })
        return false
      }
    })
  }

  return {
    submitAttendance,
    isProcessing
  }
}
