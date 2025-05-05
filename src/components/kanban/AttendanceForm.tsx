
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Attendance } from "./types"
import { SaleForm } from "./SaleForm"
import { useSale } from "./hooks/useSale"
import { useToast } from "@/components/ui/use-toast"
import { ResultButton } from "./components/attendance/ResultButton"
import { QualityScore } from "./components/attendance/QualityScore"
import { MatriculationMessage } from "./components/attendance/MatriculationMessage"
import { MatriculationSection } from "./components/attendance/MatriculationSection"
import { NegotiationSection } from "./components/attendance/NegotiationSection"
import { LossReasonSection } from "./components/attendance/LossReasonSection"
import { LossConfirmationDialog } from "./components/attendance/LossConfirmationDialog"
import { AttendanceFormProps } from "./types/attendance-form.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

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
  const [notes, setNotes] = useState("") // Novo estado para o campo de notas
  const [notesValidationError, setNotesValidationError] = useState(false) // Estado para validação
  const { registerSale, isLoading: isSaleLoading } = useSale()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedResult) return
    
    try {
      setIsProcessing(true)
      
      // Validações específicas por tipo
      if (selectedResult === 'negociacao' && !nextContactDate) {
        toast({
          variant: "destructive",
          title: "Data de próximo contato é obrigatória",
          description: "Por favor, selecione uma data para o próximo contato."
        })
        setIsProcessing(false)
        return
      }

      if (selectedResult === 'perdido' && selectedReasons.length === 0) {
        toast({
          variant: "destructive",
          title: "Motivo da perda é obrigatório",
          description: "Por favor, selecione pelo menos um motivo da perda."
        })
        setIsProcessing(false)
        return
      }

      // Validação para o campo de notas quando o resultado for matriculado
      if (selectedResult === 'matriculado' && !notes.trim()) {
        setNotesValidationError(true)
        toast({
          variant: "destructive",
          title: "Campo Descritivo é obrigatório",
          description: "Por favor, preencha o campo Descritivo para registrar a matrícula."
        })
        setIsProcessing(false)
        return
      }

      // Resetar erros de validação se tudo estiver ok
      setNotesValidationError(false)

      await onSubmit({
        result: selectedResult,
        cardId,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate,
        notes // Incluindo as notas no payload
      })
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error)
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
      // Resetar o erro de validação quando mudar o resultado
      setNotesValidationError(false)
    }
  }

  const handleLossConfirm = () => {
    setShowLossConfirmation(false)
    setSelectedResult('perdido')
  }

  // Handler para o campo de notas
  const handleNotesChange = (value: string) => {
    setNotes(value)
    // Resetar erro de validação quando o usuário digitar algo
    if (value.trim() && notesValidationError) {
      setNotesValidationError(false)
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
      {isProcessing && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando atendimento...
          </AlertDescription>
        </Alert>
      )}

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
            <>
              <MatriculationMessage clientName={clientName} />
              <MatriculationSection
                notes={notes}
                onNotesChange={handleNotesChange}
                isValidationError={notesValidationError}
                disabled={isProcessing}
              />
            </>
          )}

          {selectedResult === 'negociacao' && (
            <NegotiationSection
              nextContactDate={nextContactDate}
              observations={observations}
              onDateChange={setNextContactDate}
              onObservationsChange={setObservations}
              disabled={isProcessing}
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
              disabled={isProcessing}
            />
          )}
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={isProcessing || !selectedResult || 
          (selectedResult === 'perdido' && selectedReasons.length === 0) ||
          (selectedResult === 'negociacao' && !nextContactDate) ||
          (selectedResult === 'matriculado' && !notes.trim())}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </span>
        ) : (
          "Cadastrar Atendimento"
        )}
      </Button>

      <LossConfirmationDialog
        open={showLossConfirmation}
        onOpenChange={setShowLossConfirmation}
        onConfirm={handleLossConfirm}
      />
    </div>
  )
}
