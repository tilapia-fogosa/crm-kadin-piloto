
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
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface AttendanceFormProps {
  onSubmit: (attendance: Attendance) => void
  cardId: string
}

export function AttendanceForm({ onSubmit, cardId }: AttendanceFormProps) {
  const [selectedResult, setSelectedResult] = useState<'matriculado' | 'negociacao' | 'perdido' | undefined>(undefined)
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [observations, setObservations] = useState("")
  const [qualityScore, setQualityScore] = useState<string>("")
  const { registerSale, isLoading } = useSale()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedResult) return
    
    try {
      console.log('Registrando atendimento:', {
        result: selectedResult,
        qualityScore,
        selectedReasons,
        observations
      })

      // Atualizar quality score do cliente
      if (qualityScore) {
        const { error: scoreError } = await supabase
          .from('clients')
          .update({ lead_quality_score: parseInt(qualityScore) })
          .eq('id', cardId)

        if (scoreError) throw scoreError
      }

      // Se for perdido, registrar motivos
      if (selectedResult === 'perdido' && selectedReasons.length > 0) {
        const reasonEntries = selectedReasons.map(reasonId => ({
          client_id: cardId,
          reason_id: reasonId,
          observations: observations
        }))

        const { error: reasonsError } = await supabase
          .from('client_loss_reasons')
          .insert(reasonEntries)

        if (reasonsError) throw reasonsError
      }

      if (selectedResult === 'matriculado') {
        setShowSaleForm(true)
        return
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
    }
  }

  const handleSaleSubmit = async (sale: Sale) => {
    try {
      await registerSale(sale)
      onSubmit({
        result: 'matriculado',
        cardId
      })
    } catch (error) {
      console.error('Erro ao processar venda:', error)
    }
  }

  if (showSaleForm) {
    return (
      <SaleForm
        onSubmit={handleSaleSubmit}
        clientId={cardId}
        activityId="placeholder"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => setSelectedResult('matriculado')}
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
          onClick={() => setSelectedResult('negociacao')}
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
          onClick={() => setSelectedResult('perdido')}
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
                  placeholder="Digite suas observações..."
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!selectedResult || isLoading || (selectedResult === 'perdido' && selectedReasons.length === 0)}
      >
        {isLoading ? "Processando..." : "Cadastrar Atendimento"}
      </Button>
    </div>
  )
}
