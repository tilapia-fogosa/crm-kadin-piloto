import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { CreateOccupationData, ScheduleOccupation } from "../hooks/useScheduleOccupations"

interface OccupationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateOccupationData) => Promise<void>
  unitId: string
  occupation?: ScheduleOccupation | null
  mode: 'create' | 'edit'
}

export function OccupationModal({
  open,
  onOpenChange,
  onSubmit,
  unitId,
  occupation,
  mode
}: OccupationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: occupation?.title || '',
    description: occupation?.description || '',
    date: occupation ? format(new Date(occupation.start_datetime), 'yyyy-MM-dd') : '',
    time: occupation ? format(new Date(occupation.start_datetime), 'HH:mm') : '',
    duration_minutes: occupation?.duration_minutes || 60
  })

  // Log: Modal de ocupação renderizado
  console.log('OccupationModal - Modo:', mode, 'Ocupação:', occupation?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!formData.title.trim()) {
      console.log('OccupationModal - Título é obrigatório');
      return
    }

    if (!formData.date || !formData.time) {
      console.log('OccupationModal - Data e hora são obrigatórias');
      return
    }

    if (formData.duration_minutes < 15) {
      console.log('OccupationModal - Duração mínima de 15 minutos');
      return
    }

    setIsSubmitting(true)

    try {
      // Combinar data e hora
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      console.log('OccupationModal - Submetendo ocupação:', {
        title: formData.title,
        description: formData.description,
        start_datetime: startDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        unit_id: unitId
      });

      await onSubmit({
        title: formData.title,
        description: formData.description,
        start_datetime: startDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        unit_id: unitId
      })

      // Limpar formulário e fechar modal
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration_minutes: 60
      })
      
      onOpenChange(false)
      console.log('OccupationModal - Ocupação submetida com sucesso');
    } catch (error) {
      console.error('OccupationModal - Erro ao submeter ocupação:', error);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Ocupação' : 'Editar Ocupação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Nome da Ocupação *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Reunião de equipe"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional da ocupação"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duração (minutos) *</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'create' ? 'Criar Ocupação' : 'Atualizar Ocupação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}