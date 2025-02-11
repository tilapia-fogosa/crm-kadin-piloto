import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { ContactAttempt, EffectiveContact } from "./types"
import { useClientData } from "./hooks/useClientData"
import { transformClientsToColumnData } from "./utils/columnUtils"

export function KanbanBoard() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: clients, isLoading } = useClientData()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const handleWhatsAppClick = (e: React.MouseEvent, phoneNumber: string) => {
    e.stopPropagation()
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, '_blank')
  }

  const handleRegisterAttempt = async (attempt: ContactAttempt) => {
    try {
      console.log("Registering attempt:", attempt)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          tipo_contato: attempt.type,
          tipo_atividade: 'Tentativa de Contato',
          created_by: session.session.user.id,
          is_deleted: false
        })

      if (activityError) throw activityError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Tentativa registrada",
        description: "A atividade foi registrada com sucesso",
      })
    } catch (error) {
      console.error('Error registering attempt:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar tentativa",
        description: "Ocorreu um erro ao tentar registrar a tentativa de contato.",
      })
    }
  }

  const handleRegisterEffectiveContact = async (contact: EffectiveContact) => {
    try {
      console.log("Registering effective contact:", contact)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: contact.cardId,
          tipo_contato: contact.type,
          tipo_atividade: 'Contato Efetivo',
          notes: contact.notes,
          created_by: session.session.user.id,
          is_deleted: false
        })

      if (activityError) throw activityError

      const { error: clientError } = await supabase
        .from('clients')
        .update({ observations: contact.observations })
        .eq('id', contact.cardId)

      if (clientError) throw clientError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Contato efetivo registrado",
        description: "A atividade foi registrada com sucesso",
      })
    } catch (error) {
      console.error('Error registering effective contact:', error)
      toast({
        variant: "destructive",
        title: "Erro ao registrar contato efetivo",
        description: "Ocorreu um erro ao tentar registrar o contato efetivo.",
      })
    }
  }

  const handleDeleteActivity = async (activityId: string, clientId: string) => {
    try {
      console.log('Deleting activity:', { activityId, clientId })
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      // Primeiro, buscar os detalhes da atividade antes de excluí-la
      const { data: activityData, error: fetchError } = await supabase
        .from('client_activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (fetchError) throw fetchError
      if (!activityData) throw new Error('Activity not found')

      // Inserir o registro na tabela deleted_activities para auditoria
      const { error: insertError } = await supabase
        .from('deleted_activities')
        .insert({
          client_activity_id: activityData.id,
          client_id: activityData.client_id,
          tipo_atividade: activityData.tipo_atividade,
          tipo_contato: activityData.tipo_contato,
          notes: activityData.notes,
          next_contact_date: activityData.next_contact_date,
          original_created_at: activityData.created_at,
          original_created_by: activityData.created_by,
          deleted_by: session.session.user.id
        })

      if (insertError) throw insertError

      // Marcar a atividade como excluída (soft delete)
      const { error: updateError } = await supabase
        .from('client_activities')
        .update({ is_deleted: true })
        .eq('id', activityId)

      if (updateError) throw updateError

      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso",
      })
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir atividade",
        description: "Ocorreu um erro ao tentar excluir a atividade.",
      })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const columns = transformClientsToColumnData(clients)

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <BoardHeader 
        selectedDate={selectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        handleDateSelect={handleDateSelect}
      />

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onWhatsAppClick={handleWhatsAppClick}
            onRegisterAttempt={handleRegisterAttempt}
            onRegisterEffectiveContact={handleRegisterEffectiveContact}
            onDeleteActivity={handleDeleteActivity}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
