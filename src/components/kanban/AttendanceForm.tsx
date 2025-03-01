import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Attendance } from "./types"
import { SaleForm } from "./SaleForm"
import { useSale } from "./hooks/useSale"
import { useToast } from "@/components/ui/use-toast"
import { ResultButton } from "./components/attendance/ResultButton"
import { QualityScore } from "./components/attendance/QualityScore"
import { MatriculationMessage } from "./components/attendance/MatriculationMessage"
import { NegotiationSection } from "./components/attendance/NegotiationSection"
import { LossReasonSection } from "./components/attendance/LossReasonSection"
import { LossConfirmationDialog } from "./components/attendance/LossConfirmationDialog"
import { AttendanceFormProps } from "./types/attendance-form.types"

export function AttendanceForm({ onSubmit, cardId, clientName }: AttendanceFormProps) {
  console.log('Renderizando AttendanceForm para cliente:', clientName)

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
    console.log('Selecionando resultado:', result)
    if (result === 'perdido') {
      setShowLossConfirmation(true)
    } else {
      setSelectedResult(result)
    }
  }

  const handleLossConfirm = () => {
    setShowLossConfirmation(false)
    setSelectedResult('perdido')
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
        {['matriculado', 'negociacao', 'perdido'].map((result) => (
          <ResultButton
            key={result}
            result={result as 'matriculado' | 'negociacao' | 'perdido'}
            selectedResult={selectedResult}
            onClick={() => handleResultSelect(result as 'matriculado' | 'negociacao' | 'perdido')}
          />
        ))}
      </div>

      {selectedResult && (
        <div className="space-y-4 mt-4">
          <QualityScore 
            value={qualityScore} 
            onChange={setQualityScore} 
          />

          {selectedResult === 'matriculado' && (
            <MatriculationMessage clientName={clientName} />
          )}

          {selectedResult === 'negociacao' && (
            <NegotiationSection
              nextContactDate={nextContactDate}
              observations={observations}
              onDateChange={setNextContactDate}
              onObservationsChange={setObservations}
            />
          )}

          {selectedResult === 'perdido' && (
            <LossReasonSection
              selectedReasons={selectedReasons}
              observations={observations}
              onSelectReason={(reasonId) => {
                setSelectedReasons(prev => 
                  prev.includes(reasonId)
                    ? prev.filter(id => id !== reasonId)
                    : [...prev, reasonId]
                )
              }}
              onObservationsChange={setObservations}
            />
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

      <LossConfirmationDialog
        open={showLossConfirmation}
        onOpenChange={setShowLossConfirmation}
        onConfirm={handleLossConfirm}
      />
    </div>
  )
}
