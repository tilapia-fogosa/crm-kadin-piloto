
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    const numberValue = parseInt(numbers)
    
    // Converte para centavos
    const cents = numberValue / 100
    
    // Formata como moeda brasileira
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

    // Verifica se todos os campos obrigatórios estão preenchidos
    const hasAllRequired = requiredFields.every(field => {
      const value = sale[field]
      return value !== undefined && value !== null && value !== ''
    })

    // Verifica se o dia de vencimento está preenchido quando o método é recorrência
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
              onValueChange={value => setSale(prev => ({ ...prev, enrollment_payment_method: value as PaymentMethod }))}
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

          <div className="space-y-2">
            <Label>Data do Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sale.enrollment_payment_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sale.enrollment_payment_date ? (
                    format(sale.enrollment_payment_date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sale.enrollment_payment_date}
                  onSelect={date => setSale(prev => ({ ...prev, enrollment_payment_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              onValueChange={value => setSale(prev => ({ ...prev, material_payment_method: value as PaymentMethod }))}
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

          <div className="space-y-2">
            <Label>Data do Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sale.material_payment_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sale.material_payment_date ? (
                    format(sale.material_payment_date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sale.material_payment_date}
                  onSelect={date => setSale(prev => ({ ...prev, material_payment_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              onValueChange={value => setSale(prev => ({ ...prev, monthly_fee_payment_method: value as PaymentMethod }))}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sale.first_monthly_fee_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sale.first_monthly_fee_date ? (
                    format(sale.first_monthly_fee_date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sale.first_monthly_fee_date}
                  onSelect={date => setSale(prev => ({ ...prev, first_monthly_fee_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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

