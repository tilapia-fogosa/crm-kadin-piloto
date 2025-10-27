import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { CreateOccupationData, ScheduleOccupation } from "../hooks/useScheduleOccupations"
import { AppointmentScheduler } from "@/components/appointments/AppointmentScheduler"

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
  const [error, setError] = useState<string | null>(null)
  
  // Estados do formulário com ordem otimizada
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  // Log: Modal de ocupação renderizado
  console.log('OccupationModal - Modo:', mode, 'Duração:', durationMinutes, 'DateTime:', selectedDateTime);

  // Resetar seleção de data/horário quando duração mudar
  useEffect(() => {
    console.log('OccupationModal - Duração alterada para:', durationMinutes, '- Resetando data/horário');
    setSelectedDateTime(null);
  }, [durationMinutes]);

  // Atualizar formData quando occupation ou mode mudar
  useEffect(() => {
    if (mode === 'edit' && occupation) {
      console.log('OccupationModal - Preenchendo dados para edição:', occupation);
      setTitle(occupation.title || '');
      setDescription(occupation.description || '');
      setDurationMinutes(occupation.duration_minutes || 60);
      setSelectedDateTime(new Date(occupation.start_datetime));
    } else if (mode === 'create') {
      console.log('OccupationModal - Resetando formulário para criação');
      setTitle('');
      setDescription('');
      setDurationMinutes(60);
      setSelectedDateTime(null);
    }
  }, [occupation, mode]);

  // Resetar erro quando modal abrir
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); // Limpar erro anterior
    
    // Validações básicas
    if (!title.trim()) {
      console.log('OccupationModal - Título é obrigatório');
      setError('Título é obrigatório');
      return
    }

    if (!selectedDateTime) {
      console.log('OccupationModal - Data e hora são obrigatórias');
      setError('Selecione uma data e horário');
      return
    }

    if (durationMinutes < 15) {
      console.log('OccupationModal - Duração mínima de 15 minutos');
      setError('Duração mínima de 15 minutos');
      return
    }

    setIsSubmitting(true)

    try {
      console.log('OccupationModal - Submetendo ocupação:', {
        title,
        description,
        start_datetime: selectedDateTime.toISOString(),
        duration_minutes: durationMinutes,
        unit_id: unitId
      });

      await onSubmit({
        title,
        description,
        start_datetime: selectedDateTime.toISOString(),
        duration_minutes: durationMinutes,
        unit_id: unitId
      })

      // Limpar formulário e fechar modal apenas se sucesso
      setTitle('');
      setDescription('');
      setDurationMinutes(60);
      setSelectedDateTime(null);
      setError(null);
      
      onOpenChange(false)
      console.log('OccupationModal - Ocupação submetida com sucesso');
    } catch (error) {
      console.error('OccupationModal - Erro ao submeter ocupação:', error);
      
      // Capturar mensagem de erro específica
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar ocupação';
      setError(errorMessage);
      
      // NÃO fechar o modal para que o usuário veja o erro
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Ocupação' : 'Editar Ocupação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exibir erro se houver */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Não foi possível salvar a ocupação:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Dados básicos */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Nome da Ocupação *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião de equipe"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional da ocupação"
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          {/* ORDEM OTIMIZADA: 1. Duração primeiro */}
          <div>
            <Label htmlFor="duration">Duração *</Label>
            <Select
              value={durationMinutes.toString()}
              onValueChange={(val) => setDurationMinutes(parseInt(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="150">2h 30min</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Seletor de data e horário com slots disponíveis */}
          <div>
            <Label>Data e Horário *</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione uma data e depois escolha um horário disponível considerando a duração de {durationMinutes} minutos
            </p>
              <AppointmentScheduler
                onSelectSlot={setSelectedDateTime}
                simplified={false}
                unitId={unitId}
                durationMinutes={durationMinutes}
              />
            {selectedDateTime && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Selecionado: {selectedDateTime.toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedDateTime}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'create' ? 'Criar Ocupação' : 'Atualizar Ocupação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}