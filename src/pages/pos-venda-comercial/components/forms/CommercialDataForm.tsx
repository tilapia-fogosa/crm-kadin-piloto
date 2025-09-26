/**
 * LOG: Formulário completo para dados comerciais pós-venda
 * Implementa todos os campos com validação robusta usando ENUM kit_type
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CommercialData, PaymentMethod, KitType, KIT_TYPE_OPTIONS } from "../../types/commercial-data.types";

// LOG: Schema de validação Zod para dados comerciais usando ENUM
const commercialDataSchema = z.object({
  // Kit Type - ENUM
  kit_type: z.enum(['kit_1', 'kit_2', 'kit_3', 'kit_4', 'kit_5', 'kit_6', 'kit_7', 'kit_8']).optional(),
  
  // Matrícula
  enrollment_amount: z.coerce.number().positive("Valor deve ser positivo").optional().or(z.literal("")),
  enrollment_payment_date: z.string().optional(),
  enrollment_payment_method: z.nativeEnum({
    pix: "pix",
    dinheiro: "dinheiro", 
    cartao_credito: "cartao_credito",
    cartao_debito: "cartao_debito",
    boleto: "boleto",
    transferencia: "transferencia",
    recorrencia: "recorrencia"
  } as const).optional(),
  enrollment_installments: z.coerce.number().min(1).max(12).optional().or(z.literal("")),
  
  // Mensalidade
  monthly_fee_amount: z.coerce.number().positive("Valor deve ser positivo").optional().or(z.literal("")),
  first_monthly_fee_date: z.string().optional(),
  monthly_fee_payment_method: z.nativeEnum({
    pix: "pix",
    dinheiro: "dinheiro",
    cartao_credito: "cartao_credito", 
    cartao_debito: "cartao_debito",
    boleto: "boleto",
    transferencia: "transferencia",
    recorrencia: "recorrencia"
  } as const).optional(),
  
  // Material
  material_amount: z.coerce.number().positive("Valor deve ser positivo").optional().or(z.literal("")),
  material_payment_date: z.string().optional(),
  material_payment_method: z.nativeEnum({
    pix: "pix",
    dinheiro: "dinheiro",
    cartao_credito: "cartao_credito",
    cartao_debito: "cartao_debito", 
    boleto: "boleto",
    transferencia: "transferencia",
    recorrencia: "recorrencia"
  } as const).optional(),
  material_installments: z.coerce.number().min(1).max(12).optional().or(z.literal("")),
  
  // Observações
  observations: z.string().optional()
});

type FormData = z.infer<typeof commercialDataSchema>;

interface CommercialDataFormProps {
  initialData?: CommercialData;
  onSubmit: (data: CommercialData) => void;
  isLoading?: boolean;
}

/**
 * LOG: Opções para método de pagamento
 * Mapeamento user-friendly dos enums do banco
 */
const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'recorrencia', label: 'Recorrência' }
];

/**
 * LOG: Opções para número de parcelas (1-12)
 */
const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: i === 0 ? '1x (à vista)' : `${i + 1}x`
}));

export function CommercialDataForm({ initialData, onSubmit, isLoading }: CommercialDataFormProps) {
  console.log('LOG: Renderizando CommercialDataForm com kit types estáticos');

  // LOG: Configuração do formulário com react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(commercialDataSchema),
    defaultValues: {
      kit_type: initialData?.kit_type || undefined,
      enrollment_amount: initialData?.enrollment_amount || "",
      enrollment_payment_date: initialData?.enrollment_payment_date || "",
      enrollment_payment_method: initialData?.enrollment_payment_method || undefined,
      enrollment_installments: initialData?.enrollment_installments || "",
      monthly_fee_amount: initialData?.monthly_fee_amount || "",
      first_monthly_fee_date: initialData?.first_monthly_fee_date || "",
      monthly_fee_payment_method: initialData?.monthly_fee_payment_method || undefined,
      material_amount: initialData?.material_amount || "",
      material_payment_date: initialData?.material_payment_date || "",
      material_payment_method: initialData?.material_payment_method || undefined,
      material_installments: initialData?.material_installments || "",
      observations: initialData?.observations || ""
    }
  });

  /**
   * LOG: Handler para submit do formulário
   * Converte dados do form para CommercialData
   */
  const handleSubmit = (data: FormData) => {
    console.log('LOG: Submetendo dados do formulário:', data);
    
    const commercialData: CommercialData = {
      kit_type: data.kit_type as KitType || undefined,
      enrollment_amount: typeof data.enrollment_amount === 'number' ? data.enrollment_amount : undefined,
      enrollment_payment_date: data.enrollment_payment_date || undefined,
      enrollment_payment_method: data.enrollment_payment_method as PaymentMethod || undefined,
      enrollment_installments: typeof data.enrollment_installments === 'number' ? data.enrollment_installments : undefined,
      monthly_fee_amount: typeof data.monthly_fee_amount === 'number' ? data.monthly_fee_amount : undefined,
      first_monthly_fee_date: data.first_monthly_fee_date || undefined,
      monthly_fee_payment_method: data.monthly_fee_payment_method as PaymentMethod || undefined,
      material_amount: typeof data.material_amount === 'number' ? data.material_amount : undefined,
      material_payment_date: data.material_payment_date || undefined,
      material_payment_method: data.material_payment_method as PaymentMethod || undefined,
      material_installments: typeof data.material_installments === 'number' ? data.material_installments : undefined,
      observations: data.observations || undefined
    };

    console.log('LOG: Dados comerciais preparados para envio:', commercialData);
    onSubmit(commercialData);
  };

  /**
   * LOG: Componente reutilizável para DatePicker
   * Integrado com react-hook-form e formatação brasileira
   */
  const DatePickerField = ({ field, placeholder }: { field: any; placeholder: string }) => {
    const parsedDate = field.value ? new Date(field.value) : undefined;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(parsedDate!, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={(date) => {
              field.onChange(date ? date.toISOString().split('T')[0] : "");
            }}
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  };

  /**
   * LOG: Componente reutilizável para input monetário
   * Formatação brasileira R$ com validação
   */
  const MoneyInput = ({ field, placeholder }: { field: any; placeholder: string }) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
        R$
      </span>
      <Input
        {...field}
        type="number"
        step="0.01"
        min="0"
        placeholder={placeholder}
        className="pl-10"
        value={field.value || ""}
        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
      />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* LOG: Seção Kit Type */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">Kit Type</h3>
            <p className="text-sm text-muted-foreground">Selecione o kit comercializado</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="kit_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kit Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o kit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {KIT_TYPE_OPTIONS.map((kit) => (
                        <SelectItem key={kit.value} value={kit.value}>
                          {kit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* LOG: Seção Matrícula */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">Dados da Matrícula</h3>
            <p className="text-sm text-muted-foreground">Informações sobre o valor e pagamento da matrícula</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="enrollment_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Matrícula *</FormLabel>
                  <FormControl>
                    <MoneyInput field={field} placeholder="0,00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollment_payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento *</FormLabel>
                  <DatePickerField field={field} placeholder="Selecione a data" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="enrollment_payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollment_installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione parcelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSTALLMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* LOG: Seção Mensalidade */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">Dados da Mensalidade</h3>
            <p className="text-sm text-muted-foreground">Informações sobre valor e forma de pagamento mensal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="monthly_fee_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Mensalidade *</FormLabel>
                  <FormControl>
                    <MoneyInput field={field} placeholder="0,00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_monthly_fee_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primeira Cobrança *</FormLabel>
                  <DatePickerField field={field} placeholder="Selecione a data" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="monthly_fee_payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* LOG: Seção Material */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">Dados do Material</h3>
            <p className="text-sm text-muted-foreground">Informações sobre valor e pagamento do material didático</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="material_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Material *</FormLabel>
                  <FormControl>
                    <MoneyInput field={field} placeholder="0,00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material_payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento *</FormLabel>
                  <DatePickerField field={field} placeholder="Selecione a data" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="material_payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material_installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione parcelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSTALLMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* LOG: Seção Observações */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-foreground">Observações</h3>
            <p className="text-sm text-muted-foreground">Informações adicionais sobre a venda</p>
          </div>
          
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações Comerciais</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Observações, detalhes da negociação, condições especiais..."
                    className="min-h-[100px] resize-none"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* LOG: Botão de submit */}
        <div className="flex justify-end pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </div>
            ) : (
              'Salvar Dados'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}