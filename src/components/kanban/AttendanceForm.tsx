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
import { useAttendanceSubmission } from "./hooks/useAttendanceSubmission"
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
  const { registerSale, isLoading } = useSale()
  const { submitAttendance, isProcessing } = useAttendanceSubmission()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedResult) return
    
    try {
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

      const success = await submitAttendance({
        cardId,
        result: selectedResult,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate
      })

      if (success) {
        onSubmit({
          result: selectedResult,
          cardId
        })
      }
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error)
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
