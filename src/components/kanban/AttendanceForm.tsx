
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Attendance, Sale } from "./types"
import { SaleForm } from "./SaleForm"
import { useSale } from "./hooks/useSale"
import { LossReasonSelect } from "./LossReasonSelect"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface AttendanceFormProps {
  onSubmit: (attendance: Attendance) => void
  cardId: string
  clientName: string
}

export function AttendanceForm({ onSubmit, cardId, clientName }: AttendanceFormProps) {
  const [selectedResult, setSelectedResult] = useState<'matriculado' | 'negociacao' | 'perdido' | undefined>(undefined)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [observations, setObservations] = useState("")
  const [qualityScore, setQualityScore] = useState<string>("")
  const [nextContactDate, setNextContactDate] = useState<Date>()
  const [showLossConfirmation, setShowLossConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { registerSale, isLoading } = useSale()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedResult) return
    
    try {
      console.log('Iniciando processo de atendimento:', {
        result: selectedResult,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate
      })

      setIsProcessing(true)

      // Validações específicas por tipo
      if (selectedResult === 'negociacao' && !nextContactDate) {
        toast({
          variant: "destructive",
          title: "Data de próximo contato é obrigatória",
          description: "Por favor, selecione uma data para o próximo contato."
        })
        return
      }

      if (selectedResult === 'perdido' && selectedReasons.length === 0) {
        toast({
          variant: "destructive",
          title: "Motivo da perda é obrigatório",
          description: "Por favor, selecione pelo menos um motivo da perda."
        })
        return
      }

      // Atualizar dados do cliente
      const updateData: any = {
        lead_quality_score: qualityScore ? parseInt(qualityScore) : null,
        next_contact_date: nextContactDate ? format(nextContactDate, 'yyyy-MM-dd') : null,
        observations: observations || null,
        status: selectedResult,
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
      if (selectedResult === 'perdido' && selectedReasons.length > 0) {
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

      console.log('Atendimento finalizado com sucesso')

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

      onSubmit({
        result: selectedResult,
        cardId
      })

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
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResultSelect = (result: 'matriculado' | 'negociacao' | 'perdido') => {
    if (result === 'perdido') {
      setShowLossConfirmation(true)
    } else {
      setSelectedResult(result)
    }
  }

  if (showSaleForm) {
    return (
      <SaleForm
        onSubmit={registerSale}
        clientId={cardId}
        activityId="placeholder"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleResultSelect('matriculado')}
          className={`w-full ${
            selectedResult === 'matriculado' 
              ? 'bg-green-500 hover:bg-green-600 ring-2 ring-green-700' 
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          }`}
          variant="default"
        >
          Matriculado
        </Button>
        
        <Button
          onClick={() => handleResultSelect('negociacao')}
          className={`w-full ${
            selectedResult === 'negociacao'
              ? 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-700 text-yellow-950'
              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
          }`}
          variant="default"
        >
          Negociação
        </Button>
        
        <Button
          onClick={() => handleResultSelect('perdido')}
          className={`w-full ${
            selectedResult === 'perdido'
              ? 'bg-red-500 hover:bg-red-600 ring-2 ring-red-700 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-800'
          }`}
          variant="default"
        >
          Perdido
        </Button>
      </div>

      {selectedResult && (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Qualidade do Lead (1-10)</Label>
            <Select value={qualityScore} onValueChange={setQualityScore}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma nota" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedResult === 'matriculado' && (
            <div className="p-4 border rounded-md bg-red-50 text-red-800">
              Você irá fazer a matrícula de {clientName}, ele irá para a tela de pré-venda onde poderá ser preenchido a Ficha de Matrícula do Aluno com Todos dados.
            </div>
          )}

          {selectedResult === 'negociacao' && (
            <>
              <div className="space-y-2">
                <Label>Data do Próximo Contato</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !nextContactDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextContactDate ? format(nextContactDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={nextContactDate}
                      onSelect={setNextContactDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Digite suas observações..."
                />
              </div>
            </>
          )}

          {selectedResult === 'perdido' && (
            <>
              <div className="space-y-2">
                <Label>Motivos da Perda</Label>
                <LossReasonSelect
                  selectedReasons={selectedReasons}
                  onSelectReason={(reasonId) => {
                    setSelectedReasons(prev => 
                      prev.includes(reasonId)
                        ? prev.filter(id => id !== reasonId)
                        : [...prev, reasonId]
                    )
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Digite suas observações (opcional)..."
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!selectedResult || isLoading || isProcessing || 
          (selectedResult === 'perdido' && selectedReasons.length === 0) ||
          (selectedResult === 'negociacao' && !nextContactDate)}
      >
        {isProcessing ? "Processando..." : "Cadastrar Atendimento"}
      </Button>

      <AlertDialog open={showLossConfirmation} onOpenChange={setShowLossConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cliente como perdido?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao marcar o cliente como perdido, ele será removido do Kanban. O histórico será mantido e você poderá acessá-lo na lista de clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLossConfirmation(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowLossConfirmation(false)
                setSelectedResult('perdido')
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
