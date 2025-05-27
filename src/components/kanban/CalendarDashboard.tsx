import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarHeader } from "./components/calendar/CalendarHeader"
import { CalendarGrid } from "./components/calendar/CalendarGrid"
import { CalendarFilters } from "./components/calendar/CalendarFilters"
import { ReschedulingDialog } from "./components/scheduling/ReschedulingDialog"
import { useAgendaLeads } from "./hooks/useAgendaLeads"
import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CalendarDashboardProps {
  selectedUnitIds: string[]
}

export function CalendarDashboard({ selectedUnitIds }: CalendarDashboardProps) {
  console.log('📅 [CalendarDashboard] Renderizando com selectedUnitIds:', selectedUnitIds)
  console.log('📅 [CalendarDashboard] Quantidade de unidades selecionadas:', selectedUnitIds?.length || 0)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  const lastRefetchRef = useRef<number>(0)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    appointments,
    isLoading,
    currentDate,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth,
    refetch
  } = useAgendaLeads(selectedUnitIds)

  console.log('📅 [CalendarDashboard] UserUnits disponíveis:', userUnits?.map(u => ({ id: u.unit_id, name: u.unit_name })))
  console.log('📅 [CalendarDashboard] Agendamentos carregados:', appointments?.length || 0)

  // Mapear AgendaLead para ScheduledAppointment
  const mappedAppointments = appointments.map(appointment => ({
    id: appointment.id,
    client_name: appointment.name,
    scheduled_date: appointment.scheduled_date,
    status: 'agendado',
    unit_id: appointment.unit_id,
    unit_name: appointment.unit_name
  }))

  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('📅 [CalendarDashboard] Abrindo dialog de reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  const handleConfirmPresence = (clientId: string, clientName: string) => {
    console.log('📅 [CalendarDashboard] Iniciando confirmação de presença para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsConfirmDialogOpen(true)
  }

  const handleCancelAppointment = (clientId: string, clientName: string) => {
    console.log('📅 [CalendarDashboard] Iniciando cancelamento de agendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsCancelDialogOpen(true)
  }

  const confirmPresence = async () => {
    console.log('📅 [CalendarDashboard] Confirmando presença para cliente:', selectedClientId)
    
    try {
      // Atualizar o cliente como agendamento confirmado
      const { error } = await supabase
        .from('clients')
        .update({ 
          valorization_confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedClientId)

      if (error) throw error

      // Invalidar caches e recarregar dados
      await queryClient.invalidateQueries({ queryKey: ['user-unit'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await refetch()

      // Mostrar toast de sucesso
      toast({
        title: "Presença confirmada",
        description: `A presença de ${selectedClientName} foi confirmada com sucesso.`,
        variant: "default"
      })

      console.log('✅ [CalendarDashboard] Presença confirmada com sucesso')
    } catch (error) {
      console.error('❌ [CalendarDashboard] Erro ao confirmar presença:', error)
      toast({
        title: "Erro ao confirmar presença",
        description: "Não foi possível confirmar a presença. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsConfirmDialogOpen(false)
      setSelectedClientId("")
      setSelectedClientName("")
    }
  }

  const cancelAppointment = async () => {
    console.log('📅 [CalendarDashboard] Cancelando agendamento para cliente:', selectedClientId)
    
    try {
      // Remover o agendamento (limpar scheduled_date)
      const { error } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: null,
          status: 'contato-efetivo', // Voltar ao status anterior
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedClientId)

      if (error) throw error

      // Invalidar caches e recarregar dados
      await queryClient.invalidateQueries({ queryKey: ['user-unit'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      await refetch()

      // Mostrar toast de sucesso
      toast({
        title: "Agendamento cancelado",
        description: `O agendamento de ${selectedClientName} foi cancelado. Você pode reagendar quando necessário.`,
        variant: "default"
      })

      console.log('✅ [CalendarDashboard] Agendamento cancelado com sucesso')
    } catch (error) {
      console.error('❌ [CalendarDashboard] Erro ao cancelar agendamento:', error)
      toast({
        title: "Erro ao cancelar agendamento",
        description: "Não foi possível cancelar o agendamento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsCancelDialogOpen(false)
      setSelectedClientId("")
      setSelectedClientName("")
    }
  }

  const handleRescheduleSuccess = async () => {
    console.log('📅 [CalendarDashboard] Reagendamento realizado com sucesso - atualizando dados')
    
    // Prevenir múltiplas chamadas em sequência
    const now = Date.now()
    if (now - lastRefetchRef.current < 1000) {
      console.log('📅 [CalendarDashboard] Ignorando refetch - muito recente')
      return
    }
    lastRefetchRef.current = now
    
    try {
      // Invalidar caches relacionados
      await queryClient.invalidateQueries({ queryKey: ['user-unit'] })
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      
      // Recarregar dados da agenda
      await refetch()
      
      // Fechar dialog de reagendamento
      setIsReschedulingDialogOpen(false)
      
      // Mostrar toast de sucesso
      toast({
        title: "Reagendamento realizado",
        description: `Agendamento de ${selectedClientName} foi atualizado com sucesso.`,
        variant: "default"
      })
      
      console.log('📅 [CalendarDashboard] Dados atualizados após reagendamento')
    } catch (error) {
      console.error('❌ [CalendarDashboard] Erro ao atualizar após reagendamento:', error)
    }
  }

  if (isLoadingUnits) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Agenda</span>
            <span className="text-xs">de Leads</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Agenda</span>
            <span className="text-xs">de Leads</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <CalendarFilters 
              userUnits={userUnits}
              selectedUnitIds={selectedUnitIds}
              isLoading={isLoadingUnits}
            />
            
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              isLoading={isLoading}
            />
          </div>

          <CalendarGrid
            currentDate={currentDate}
            isLoadingAppointments={isLoading}
            scheduledAppointments={mappedAppointments}
            onReschedule={handleReschedule}
            onConfirmPresence={handleConfirmPresence}
            onCancelAppointment={handleCancelAppointment}
            userUnits={userUnits}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Reagendamento */}
      {selectedClientId && (
        <ReschedulingDialog
          open={isReschedulingDialogOpen}
          onOpenChange={setIsReschedulingDialogOpen}
          clientId={selectedClientId}
          clientName={selectedClientName}
          onSubmit={handleRescheduleSuccess}
        />
      )}

      {/* Dialog de Confirmação de Presença */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Presença</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja confirmar a presença de <strong>{selectedClientName}</strong>?
              Esta ação marcará o agendamento como confirmado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPresence}>
              Confirmar Presença
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Cancelamento de Agendamento */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar o agendamento de <strong>{selectedClientName}</strong>?
              O cliente voltará para o status "Contato Efetivo" e você poderá reagendar quando necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={cancelAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
