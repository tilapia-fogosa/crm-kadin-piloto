
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Sale, PaymentMethod, DueDay } from "./types"

interface SaleFormProps {
  onSubmit: (sale: Sale) => Promise<void>
  clientId: string
  activityId: string
}

export function SaleForm({ onSubmit, clientId, activityId }: SaleFormProps) {
  const [sale, setSale] = useState<Partial<Sale>>({
    client_id: clientId,
    attendance_activity_id: activityId,
    enrollment_installments: 1,
    material_installments: 1
  })

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const numberValue = parseInt(numbers)
    const cents = numberValue / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents)
  }

  const handleCurrencyInput = (field: keyof Sale, value: string) => {
    const numbers = value.replace(/\D/g, '')
    const numberValue = parseInt(numbers)
    setSale(prev => ({
      ...prev,
      [field]: numberValue / 100
    }))
  }

  const handleDateInput = (field: keyof Sale, value: string) => {
    try {
      const date = new Date(value)
      setSale(prev => ({
        ...prev,
        [field]: date
      }))
    } catch (error) {
      console.error('Data inválida:', error)
    }
  }

  const handlePaymentMethodChange = (field: 'enrollment_payment_method' | 'material_payment_method' | 'monthly_fee_payment_method', value: PaymentMethod) => {
    const updates: Partial<Sale> = {
      [field]: value
    }

    // Reseta parcelas para 1 quando mudar forma de pagamento
    if (field === 'enrollment_payment_method') {
      updates.enrollment_installments = 1
    } else if (field === 'material_payment_method') {
      updates.material_installments = 1
    }

    setSale(prev => ({
      ...prev,
      ...updates
    }))
  }

  const setTodayDate = (field: keyof Sale) => {
    setSale(prev => ({
      ...prev,
      [field]: new Date()
    }))
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return
    await onSubmit(sale as Sale)
  }

  const isFormValid = () => {
    const requiredFields: (keyof Sale)[] = [
      'enrollment_amount',
      'enrollment_payment_method',
      'enrollment_installments',
      'enrollment_payment_date',
      'material_amount',
      'material_payment_method',
      'material_installments',
      'material_payment_date',
      'monthly_fee_amount',
      'monthly_fee_payment_method',
      'first_monthly_fee_date'
    ]

    const hasAllRequired = requiredFields.every(field => {
      const value = sale[field]
      return value !== undefined && value !== null && value !== ''
    })

    const needsDueDay = sale.monthly_fee_payment_method === 'recorrencia'
    const hasDueDay = sale.monthly_fee_due_day !== undefined

    return hasAllRequired && (!needsDueDay || hasDueDay)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Informações Importantes do Cliente</h4>
        <Textarea
          value={sale.important_info || ''}
          onChange={e => setSale(prev => ({ ...prev, important_info: e.target.value }))}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Matrícula</h4>
          
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={sale.enrollment_amount ? formatCurrency(String(sale.enrollment_amount * 100)) : ''}
              onChange={e => handleCurrencyInput('enrollment_amount', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={sale.enrollment_payment_method}
              onValueChange={value => handlePaymentMethodChange('enrollment_payment_method', value as PaymentMethod)}
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

          {sale.enrollment_payment_method === 'cartao_credito' && (
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Select
                value={String(sale.enrollment_installments)}
                onValueChange={value => setSale(prev => ({ ...prev, enrollment_installments: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={String(num)}>{num}x</SelectItem>
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
                value={sale.enrollment_payment_date ? format(sale.enrollment_payment_date, "yyyy-MM-dd") : ''}
                onChange={e => handleDateInput('enrollment_payment_date', e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => setTodayDate('enrollment_payment_date')}
                className="bg-green-500 hover:bg-green-600 h-10 px-3"
              >
                Hoje
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Material Didático</h4>
          
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={sale.material_amount ? formatCurrency(String(sale.material_amount * 100)) : ''}
              onChange={e => handleCurrencyInput('material_amount', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={sale.material_payment_method}
              onValueChange={value => handlePaymentMethodChange('material_payment_method', value as PaymentMethod)}
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

          {(sale.material_payment_method === 'cartao_credito' || sale.material_payment_method === 'boleto') && (
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Select
                value={String(sale.material_installments)}
                onValueChange={value => setSale(prev => ({ ...prev, material_installments: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={String(num)}>{num}x</SelectItem>
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
                value={sale.material_payment_date ? format(sale.material_payment_date, "yyyy-MM-dd") : ''}
                onChange={e => handleDateInput('material_payment_date', e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => setTodayDate('material_payment_date')}
                className="bg-green-500 hover:bg-green-600 h-10 px-3"
              >
                Hoje
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Mensalidade</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={sale.monthly_fee_amount ? formatCurrency(String(sale.monthly_fee_amount * 100)) : ''}
              onChange={e => handleCurrencyInput('monthly_fee_amount', e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={sale.monthly_fee_payment_method}
              onValueChange={value => handlePaymentMethodChange('monthly_fee_payment_method', value as PaymentMethod)}
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
              value={sale.first_monthly_fee_date ? format(sale.first_monthly_fee_date, "yyyy-MM-dd") : ''}
              onChange={e => handleDateInput('first_monthly_fee_date', e.target.value)}
            />
          </div>

          {sale.monthly_fee_payment_method === 'recorrencia' && (
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Select
                value={sale.monthly_fee_due_day}
                onValueChange={value => setSale(prev => ({ ...prev, monthly_fee_due_day: value as DueDay }))}
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

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!isFormValid()}
      >
        Cadastrar Venda
      </Button>
    </div>
  )
}
