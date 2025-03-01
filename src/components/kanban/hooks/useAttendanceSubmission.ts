
import { useState } from "react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Attendance } from "../types"

export function useAttendanceSubmission() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

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
    try {
      console.log('Iniciando processo de atendimento:', {
        result,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate
      })

      setIsProcessing(true)

      // Atualizar dados do cliente
      const updateData: any = {
        lead_quality_score: qualityScore ? parseInt(qualityScore) : null,
        next_contact_date: nextContactDate ? format(nextContactDate, 'yyyy-MM-dd') : null,
        observations: observations || null,
        status: result,
        updated_at: new Date().toISOString()
      }

      console.log('Atualizando cliente com dados:', updateData)

      const { error: updateError } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', cardId)

      if (updateError) {
        console.error('Erro ao atualizar cliente:', updateError)
        throw updateError
      }

      // Se for perdido, registrar motivos
      if (result === 'perdido' && selectedReasons?.length) {
        const reasonEntries = selectedReasons.map(reasonId => ({
          client_id: cardId,
          reason_id: reasonId,
          observations: observations || null
        }))

        console.log('Registrando motivos da perda:', reasonEntries)

        const { error: reasonsError } = await supabase
          .from('client_loss_reasons')
          .insert(reasonEntries)

        if (reasonsError) {
          console.error('Erro ao registrar motivos:', reasonsError)
          throw reasonsError
        }
      }

      // Registra a atividade
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: cardId,
          tipo_atividade: 'Atendimento',
          tipo_contato: 'presencial',
          notes: observations || null,
          created_by: (await supabase.auth.getSession()).data.session?.user.id
        })

      if (activityError) {
        console.error('Erro ao registrar atividade:', activityError)
        throw activityError
      }

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
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    submitAttendance,
    isProcessing
  }
}
