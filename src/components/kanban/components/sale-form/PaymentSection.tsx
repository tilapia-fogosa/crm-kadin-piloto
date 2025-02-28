
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentMethod } from "../../types"

interface PaymentSectionProps {
  title: string
  amount: number | undefined
  paymentMethod: PaymentMethod | undefined
  installments: number
  paymentDate: string | undefined
  onAmountChange: (value: number) => void
  onPaymentMethodChange: (value: PaymentMethod) => void
  onInstallmentsChange: (value: number) => void
  onPaymentDateChange: (value: string) => void
  onTodayClick: () => void
  showInstallments?: boolean
  maxInstallments?: number
}

export function PaymentSection({
  title,
  amount,
  paymentMethod,
  installments,
  paymentDate,
  onAmountChange,
  onPaymentMethodChange,
  onInstallmentsChange,
  onPaymentDateChange,
  onTodayClick,
  showInstallments = true,
  maxInstallments = 12
}: PaymentSectionProps) {
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
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="border rounded-lg p-4 space-y-4">
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
            </SelectContent>
          </Select>
        </div>

        {showInstallments && paymentMethod === 'cartao_credito' && (
          <div className="space-y-2">
            <Label>Número de Parcelas</Label>
            <Select
              value={String(installments)}
              onValueChange={value => onInstallmentsChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={String(num)}>{num} vezes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Data do Pagamento</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={paymentDate || ''}
              onChange={e => onPaymentDateChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={onTodayClick}
              className="bg-green-500 hover:bg-green-600 h-10 px-3"
            >
              Hoje
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
