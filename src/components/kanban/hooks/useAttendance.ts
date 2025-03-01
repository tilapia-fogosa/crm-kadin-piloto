
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Attendance } from "../types"

export function useAttendance() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const registerAttendance = async (attendance: Attendance) => {
    try {
      console.log("Registrando atendimento:", attendance)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Registra a atividade de Atendimento
      const { data: attendanceActivity, error: attendanceError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attendance.cardId,
          tipo_atividade: 'Atendimento',
          tipo_contato: 'presencial',
          created_by: session.session.user.id,
          active: true
        })
        .select()
        .single()

      if (attendanceError) throw attendanceError

      // Se o resultado for matrícula, cria a atividade de Matrícula
      if (attendance.result === 'matriculado') {
        console.log("Cliente matriculado, registrando atividade de matrícula")
        
        const { error: matriculaError } = await supabase
          .from('client_activities')
          .insert({
            client_id: attendance.cardId,
            tipo_atividade: 'Matrícula',
            tipo_contato: 'presencial',
            created_by: session.session.user.id,
            active: true
          })

        if (matriculaError) throw matriculaError
      }

      // Atualiza o status do cliente
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          status: attendance.result,
          updated_at: new Date().toISOString()
        })
        .eq('id', attendance.cardId)

      if (updateError) throw updateError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Atendimento registrado",
        description: "O atendimento foi registrado com sucesso."
      })
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar atendimento",
        description: "Ocorreu um erro ao tentar registrar o atendimento."
      })
    }
  }

  return {
    registerAttendance
  }
}
