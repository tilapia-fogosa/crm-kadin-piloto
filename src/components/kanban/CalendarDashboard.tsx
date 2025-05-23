
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarHeader } from "./components/calendar/CalendarHeader"
import { CalendarGrid } from "./components/calendar/CalendarGrid"
import { CalendarFilters } from "./components/calendar/CalendarFilters"
import { ReschedulingDialog } from "./components/scheduling/ReschedulingDialog"
import { useAgendaLeads } from "./hooks/useAgendaLeads"
import { useState } from "react"

interface CalendarDashboardProps {
  selectedUnitIds: string[]
}

export function CalendarDashboard({ selectedUnitIds }: CalendarDashboardProps) {
  console.log('📅 [CalendarDashboard] Renderizando com selectedUnitIds:', selectedUnitIds)
  console.log('📅 [CalendarDashboard] Quantidade de unidades selecionadas:', selectedUnitIds?.length || 0)
  
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")

  const {
    appointments,
    isLoading,
    currentDate,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth
  } = useAgendaLeads(selectedUnitIds)

  console.log('📅 [CalendarDashboard] UserUnits disponíveis:', userUnits?.map(u => ({ id: u.unit_id, name: u.units.name })))
  console.log('📅 [CalendarDashboard] Agendamentos carregados:', appointments?.length || 0)

  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('📅 [CalendarDashboard] Abrindo dialog de reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">Agenda</span>
          <span className="text-xs">de Leads</span>
          {appointments && appointments.length > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
              {appointments.length}
            </span>
          )}
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
          />
        </div>

        <CalendarGrid
          currentDate={currentDate}
          isLoadingAppointments={isLoading}
          scheduledAppointments={appointments}
          onReschedule={handleReschedule}
          userUnits={userUnits}
        />

        {/* Debug info para desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug Info (Nova Implementação):</strong><br/>
            Unidades selecionadas: {selectedUnitIds?.length || 0}<br/>
            Agendamentos: {appointments?.length || 0}<br/>
            Carregando: {isLoading ? 'Sim' : 'Não'}<br/>
            Mês/Ano: {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
          </div>
        )}
      </DialogContent>

      {selectedClientId && (
        <ReschedulingDialog
          open={isReschedulingDialogOpen}
          onOpenChange={setIsReschedulingDialogOpen}
          clientId={selectedClientId}
          clientName={selectedClientName}
          onSubmit={(scheduling) => {
            console.log('📅 [CalendarDashboard] Agendamento remarcado:', scheduling)
            setIsReschedulingDialogOpen(false)
          }}
        />
      )}
    </Dialog>
  )
}
