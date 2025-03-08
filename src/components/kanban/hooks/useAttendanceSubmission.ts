
import { useState } from "react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Attendance } from "../types"
import { useDebounceSubmission } from "./useDebounceSubmission"
import { useQueryClient } from "@tanstack/react-query"

export function useAttendanceSubmission() {
  const { toast } = useToast()
  const { isProcessing, wrapSubmission } = useDebounceSubmission()
  const queryClient = useQueryClient()

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

        // Get client's unit_id
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('unit_id')
          .eq('id', cardId)
          .single()

        if (clientError) throw clientError
        if (!clientData?.unit_id) throw new Error('Client has no unit_id')

        const session = (await supabase.auth.getSession()).data.session
        if (!session) throw new Error('Not authenticated')

        // Registra a atividade de Atendimento
        const { data: attendanceActivity, error: attendanceError } = await supabase
          .from('client_activities')
          .insert({
            client_id: cardId,
            tipo_atividade: 'Atendimento',
            tipo_contato: 'presencial',
            notes: observations || null,
            unit_id: clientData.unit_id,
            created_by: session.user.id,
            active: true
          })
          .select()
          .single()

        if (attendanceError) throw attendanceError

        // Se for matriculado, registra atividade de Matrícula
        if (result === 'matriculado') {
          console.log("Cliente matriculado, registrando atividade de matrícula")
          
          const { error: matriculaError } = await supabase
            .from('client_activities')
            .insert({
              client_id: cardId,
              tipo_atividade: 'Matrícula',
              tipo_contato: 'presencial',
              created_by: session.user.id,
              unit_id: clientData.unit_id,
              active: true
            })

          if (matriculaError) throw matriculaError
        }

        // Se houver motivos de perda, registra-os
        if (result === 'perdido' && selectedReasons?.length) {
          console.log("Registrando motivos de perda:", selectedReasons)
          
          const reasonEntries = selectedReasons.map(reasonId => ({
            client_id: cardId,
            reason_id: reasonId,
            observations: observations || null
          }))

          const { error: reasonsError } = await supabase
            .from('client_loss_reasons')
            .insert(reasonEntries)

          if (reasonsError) throw reasonsError
        }

        // Atualiza o status do cliente
        const updateData: any = {
          status: result,
          lead_quality_score: qualityScore ? parseInt(qualityScore) : null,
          next_contact_date: nextContactDate ? format(nextContactDate, 'yyyy-MM-dd') : null,
          observations: observations || null,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', cardId)

        if (updateError) throw updateError

        await queryClient.invalidateQueries({ queryKey: ['clients'] })

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
