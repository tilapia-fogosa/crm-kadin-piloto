
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

  const handleDateSelect = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    event.stopPropagation()
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

      // First, insert the activity
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          tipo_contato: attempt.type,
          tipo_atividade: 'Tentativa de Contato',
          next_contact_date: attempt.nextContactDate.toISOString(),
          created_by: session.session.user.id
        })

      if (activityError) throw activityError

      // Then, update the client status
      const { error: statusError } = await supabase
        .from('clients')
        .update({ 
          status: 'tentativa-contato',
          updated_at: new Date().toISOString()
        })
        .eq('id', attempt.cardId)

      if (statusError) throw statusError

      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Tentativa registrada",
        description: "O lead foi movido para 'Em tentativa de Contato'",
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

      // First, insert the activity
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: contact.cardId,
          tipo_contato: contact.type,
          tipo_atividade: 'Contato Efetivo',
          notes: contact.notes,
          created_by: session.session.user.id
        })

      if (activityError) throw activityError

      // Then, update the client status and observations
      const { error: statusError } = await supabase
        .from('clients')
        .update({ 
          status: 'contato-efetivo',
          observations: contact.observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.cardId)

      if (statusError) throw statusError

      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['clients'] })

      toast({
        title: "Contato efetivo registrado",
        description: "O lead foi movido para 'Contato Efetivo'",
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
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
