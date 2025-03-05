
import { useState } from "react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Attendance } from "../types"
import { useDebounceSubmission } from "./useDebounceSubmission"

export function useAttendanceSubmission() {
  const { toast } = useToast()
  const { isProcessing, wrapSubmission } = useDebounceSubmission()

  const submitAttendance = async ({
    cardId,
    result,
    qualityScore,
    selectedReasons,
    observations,
    nextContactDate
  }: {
    cardId: string
    result: 'matriculado' | 'negociacao' | 'perdido'
    qualityScore?: string
    selectedReasons?: string[]
    observations?: string
    nextContactDate?: Date
  }) => {
    return wrapSubmission(async () => {
      try {
        console.log('Iniciando submissão de atendimento:', {
          cardId,
          result,
          qualityScore,
          selectedReasons,
          observations,
          nextContactDate
        })

        // Atualizar dados do cliente
        const updateData: any = {
          lead_quality_score: qualityScore ? parseInt(qualityScore) : null,
          next_contact_date: nextContactDate ? format(nextContactDate, 'yyyy-MM-dd') : null,
          observations: observations || null,
          status: result,
          updated_at: new Date().toISOString()
        }

        console.log('Tentando atualizar cliente com dados:', updateData)

        const { error: updateError, data: updateResult } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', cardId)
          .select()

        console.log('Resultado da atualização do cliente:', { updateResult, updateError })

        if (updateError) {
          console.error('Erro ao atualizar cliente:', updateError)
          throw updateError
        }

        // Se for perdido, registrar motivos
        if (result === 'perdido' && selectedReasons?.length) {
          console.log('Registrando motivos da perda:', {
            clientId: cardId,
            reasons: selectedReasons
          })

          const reasonEntries = selectedReasons.map(reasonId => ({
            client_id: cardId,
            reason_id: reasonId,
            observations: observations || null
          }))

          const { error: reasonsError, data: reasonsResult } = await supabase
            .from('client_loss_reasons')
            .insert(reasonEntries)
            .select()

          console.log('Resultado do registro de motivos:', { reasonsResult, reasonsError })

          if (reasonsError) {
            console.error('Erro ao registrar motivos:', reasonsError)
            throw reasonsError
          }
        }

        // Registra a atividade
        console.log('Registrando atividade de atendimento')

        const { error: activityError, data: activityResult } = await supabase
          .from('client_activities')
          .insert({
            client_id: cardId,
            tipo_atividade: 'Atendimento',
            tipo_contato: 'presencial',
            notes: observations || null,
            created_by: (await supabase.auth.getSession()).data.session?.user.id
          })
          .select()

        console.log('Resultado do registro de atividade:', { activityResult, activityError })

        if (activityError) {
          console.error('Erro ao registrar atividade:', activityError)
          throw activityError
        }

        console.log('Atendimento registrado com sucesso')

        toast({
          title: "Atendimento registrado",
          description: "O atendimento foi registrado com sucesso."
        })

        return true
      } catch (error) {
        console.error('Erro ao registrar atendimento:', error)
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
