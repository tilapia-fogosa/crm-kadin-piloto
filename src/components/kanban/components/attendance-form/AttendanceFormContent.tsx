
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Attendance } from "../../types"
import { SaleForm } from "../../SaleForm"
import { useSale } from "../../hooks/useSale"
import { useToast } from "@/hooks/use-toast"
import { ResultButtons } from "./ResultButtons"
import { QualityScore } from "../attendance/QualityScore"
import { MatriculationMessage } from "../attendance/MatriculationMessage"
import { MatriculationSection } from "./sections/MatriculationSection"
import { NegotiationSection } from "./sections/NegotiationSection"
import { LossReasonSection } from "./sections/LossReasonSection"
import { LossConfirmationDialog } from "../attendance/LossConfirmationDialog"
import { AttendanceFormProps } from "../../types/attendance-form.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAttendanceFormState } from "./hooks/useAttendanceFormState"

export function AttendanceFormContent({ onSubmit, cardId, clientName, isDisabled = false }: AttendanceFormProps) {
  const {
    selectedResult,
    showSaleForm,
    selectedReasons,
    observations,
    qualityScore,
    nextContactDate,
    notes,
    notesValidationError,
    studentName,
    studentNameValidationError,
    isProcessing,
    setShowSaleForm,
    setSelectedResult,
    setSelectedReasons,
    setObservations,
    setQualityScore,
    setNextContactDate,
    setIsProcessing,
    setNotes,
    setNotesValidationError,
    setStudentName,
    setStudentNameValidationError
  } = useAttendanceFormState();

  const [showLossConfirmation, setShowLossConfirmation] = useState(false)
  const { registerSale } = useSale()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedResult || isDisabled) return
    
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

      // Validação para o nome completo do aluno quando matriculado
      if (selectedResult === 'matriculado' && !studentName.trim()) {
        setStudentNameValidationError(true)
        toast({
          variant: "destructive",
          title: "Nome completo do Aluno é obrigatório",
          description: "Por favor, preencha o nome completo do aluno para registrar a matrícula."
        })
        setIsProcessing(false)
        return
      }

      // Resetar erros de validação se tudo estiver ok
      setNotesValidationError(false)
      setStudentNameValidationError(false)

      await onSubmit({
        result: selectedResult,
        cardId,
        qualityScore,
        selectedReasons,
        observations,
        nextContactDate,
        notes,
        studentName: studentName.trim() || undefined
      })
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResultSelect = (result: 'matriculado' | 'negociacao' | 'perdido') => {
    if (isDisabled) return
    
    console.log('Selecionando resultado:', result)
    if (result === 'perdido') {
      setShowLossConfirmation(true)
    } else {
      setSelectedResult(result)
      // Resetar erros de validação quando mudar o resultado
      setNotesValidationError(false)
      setStudentNameValidationError(false)
    }
  }

  const handleLossConfirm = () => {
    setShowLossConfirmation(false)
    setSelectedResult('perdido')
  }

  // Handler para o campo de notas
  const handleNotesChange = (value: string) => {
    if (isDisabled) return
    
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
      {(isProcessing || isDisabled) && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isDisabled ? 'Aguarde...' : 'Processando atendimento...'}
          </AlertDescription>
        </Alert>
      )}

      <ResultButtons 
        selectedResult={selectedResult} 
        onResultSelect={handleResultSelect}
        disabled={isDisabled}
      />

      {selectedResult && (
        <div className="space-y-4 mt-4">
          <QualityScore 
            value={qualityScore} 
            onChange={setQualityScore}
            disabled={isDisabled}
          />

          {selectedResult === 'matriculado' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome completo do Aluno *</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => {
                    if (isDisabled) return
                    setStudentName(e.target.value)
                    if (e.target.value.trim() && studentNameValidationError) {
                      setStudentNameValidationError(false)
                    }
                  }}
                  placeholder="Digite o nome completo do aluno"
                  disabled={isDisabled || isProcessing}
                  className={studentNameValidationError ? "border-destructive" : ""}
                />
                {studentNameValidationError && (
                  <p className="text-sm text-destructive">
                    Nome completo do aluno é obrigatório.
                  </p>
                )}
              </div>
              <MatriculationMessage clientName={studentName.trim() || clientName} />
              <MatriculationSection
                notes={notes}
                onNotesChange={handleNotesChange}
                isValidationError={notesValidationError}
                disabled={isDisabled || isProcessing}
              />
            </>
          )}

          {selectedResult === 'negociacao' && (
            <NegotiationSection
              nextContactDate={nextContactDate}
              observations={observations}
              onDateChange={setNextContactDate}
              onObservationsChange={setObservations}
              disabled={isDisabled || isProcessing}
            />
          )}

          {selectedResult === 'perdido' && (
            <LossReasonSection
              selectedReasons={selectedReasons}
              observations={observations}
              onSelectReason={(reasonId) => {
                if (isDisabled) return
                setSelectedReasons(prev => 
                  prev.includes(reasonId)
                    ? prev.filter(id => id !== reasonId)
                    : [...prev, reasonId]
                )
              }}
              onObservationsChange={setObservations}
              disabled={isDisabled || isProcessing}
            />
          )}
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={isDisabled || isProcessing || !selectedResult || 
          (selectedResult === 'perdido' && selectedReasons.length === 0) ||
          (selectedResult === 'negociacao' && !nextContactDate) ||
          (selectedResult === 'matriculado' && !notes.trim()) ||
          (selectedResult === 'matriculado' && !studentName.trim())}
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
