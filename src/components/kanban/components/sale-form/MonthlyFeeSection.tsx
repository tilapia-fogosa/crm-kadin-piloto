
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentMethod, DueDay } from "../../types"

interface MonthlyFeeSectionProps {
  amount: number | undefined
  paymentMethod: PaymentMethod | undefined
  dueDay: DueDay | undefined
  firstPaymentDate: string | undefined
  onAmountChange: (value: number) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onDueDayChange: (value: DueDay) => void
  onFirstPaymentDateChange: (value: string) => void
}

export function MonthlyFeeSection({
  amount,
  paymentMethod,
  dueDay,
  firstPaymentDate,
  onAmountChange,
  onPaymentMethodChange,
  onDueDayChange,
  onFirstPaymentDateChange
}: MonthlyFeeSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const numberValue = parseInt(numbers)
    onAmountChange(numberValue / 100)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Mensalidade</h4>
      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={amount ? formatCurrency(amount) : ''}
              onChange={e => handleCurrencyInput(e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={value => onPaymentMethodChange(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="recorrencia">Recorrência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data da Primeira Mensalidade</Label>
            <Input
              type="date"
              value={firstPaymentDate || ''}
              onChange={e => onFirstPaymentDateChange(e.target.value)}
            />
          </div>

          {paymentMethod === 'recorrencia' && (
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Select
                value={dueDay}
                onValueChange={value => onDueDayChange(value as DueDay)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Dia 5</SelectItem>
                  <SelectItem value="10">Dia 10</SelectItem>
                  <SelectItem value="15">Dia 15</SelectItem>
                  <SelectItem value="20">Dia 20</SelectItem>
                  <SelectItem value="25">Dia 25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
