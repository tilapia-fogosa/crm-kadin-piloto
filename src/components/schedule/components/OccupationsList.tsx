import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Calendar, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ScheduleOccupation } from "../hooks/useScheduleOccupations"
import { OccupationModal } from "./OccupationModal"

interface OccupationsListProps {
  occupations: ScheduleOccupation[]
  onCreateOccupation: (data: any) => Promise<void>
  onUpdateOccupation: (id: string, data: any) => Promise<void>
  onDeleteOccupation: (id: string) => Promise<void>
  unitId: string
  isLoading: boolean
}

export function OccupationsList({
  occupations,
  onCreateOccupation,
  onUpdateOccupation,
  onDeleteOccupation,
  unitId,
  isLoading
}: OccupationsListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOccupation, setSelectedOccupation] = useState<ScheduleOccupation | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // Log: Lista de ocupações renderizada
  console.log('OccupationsList - Ocupações:', occupations.length, 'Carregando:', isLoading);

  const handleCreateClick = () => {
    console.log('OccupationsList - Abrindo modal para criar ocupação');
    setSelectedOccupation(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEditClick = (occupation: ScheduleOccupation) => {
    console.log('OccupationsList - Abrindo modal para editar ocupação:', occupation.id);
    setSelectedOccupation(occupation)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeleteClick = async (occupation: ScheduleOccupation) => {
    if (window.confirm(`Tem certeza que deseja remover a ocupação "${occupation.title}"?`)) {
      console.log('OccupationsList - Deletando ocupação:', occupation.id);
      await onDeleteOccupation(occupation.id)
    }
  }

  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create') {
      await onCreateOccupation(data)
    } else if (selectedOccupation) {
      await onUpdateOccupation(selectedOccupation.id, data)
    }
  }

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Ocupações da Agenda</h2>
        <Button onClick={handleCreateClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocupação
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando ocupações...
        </div>
      ) : occupations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma ocupação cadastrada</p>
          <p className="text-sm">Clique em "Nova Ocupação" para começar</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {occupations.map((occupation) => (
            <div
              key={occupation.id}
              className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    {occupation.title}
                  </h3>
                  {occupation.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {occupation.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(occupation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(occupation)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(occupation.start_datetime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(occupation.duration_minutes)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{occupation.created_by_name}</span>
                </div>
              </div>

              <div className="mt-3">
              <Badge variant="outline" className="text-xs border-primary text-primary">
                Ocupação Ativa
              </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <OccupationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleModalSubmit}
        unitId={unitId}
        occupation={selectedOccupation}
        mode={modalMode}
      />
    </div>
  )
}