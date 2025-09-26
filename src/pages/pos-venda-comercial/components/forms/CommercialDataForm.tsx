/**
 * LOG: Formulário completo para dados comerciais pós-venda
 * Implementa todos os campos com validação robusta usando ENUM kit_type
 */

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
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

  // LOG: Estado para controle dos accordions e seções completadas
  const [openAccordions, setOpenAccordions] = useState<string[]>(["kit-type"]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

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

  // LOG: Observar mudanças nos campos do formulário
  const watchedValues = useWatch({ control: form.control });

  /**
   * LOG: Funções para verificar completude de cada seção
   */
  const isKitTypeComplete = () => {
    return !!watchedValues.kit_type;
  };

  const isEnrollmentComplete = () => {
    return !!(
      watchedValues.enrollment_amount &&
      watchedValues.enrollment_payment_date &&
      watchedValues.enrollment_payment_method &&
      watchedValues.enrollment_installments
    );
  };

  const isMonthlyFeeComplete = () => {
    return !!(
      watchedValues.monthly_fee_amount &&
      watchedValues.monthly_fee_payment_method &&
      watchedValues.first_monthly_fee_date
    );
  };

  const isMaterialComplete = () => {
    return !!(
      watchedValues.material_amount &&
      watchedValues.material_payment_date &&
      watchedValues.material_payment_method &&
      watchedValues.material_installments
    );
  };

  /**
   * LOG: Efeito para controle inteligente dos accordions
   * Atualiza seções completadas e sugere próxima seção sem forçar fechamento
   */
  useEffect(() => {
    console.log('LOG: Verificando completude das seções:', {
      kit: isKitTypeComplete(),
      enrollment: isEnrollmentComplete(),
      monthlyFee: isMonthlyFeeComplete(),
      material: isMaterialComplete()
    });

    const newCompletedSections = new Set<string>();
    
    // Marcar seções completadas
    if (isKitTypeComplete()) newCompletedSections.add("kit-type");
    if (isEnrollmentComplete()) newCompletedSections.add("enrollment");
    if (isMonthlyFeeComplete()) newCompletedSections.add("monthly-fee");
    if (isMaterialComplete()) newCompletedSections.add("material");
    
    setCompletedSections(newCompletedSections);

    // Lógica de sugestão automática (não forçada) - apenas na primeira completude
    const prevCompleted = completedSections;
    
    // Se kit foi completado pela primeira vez, sugerir matrícula
    if (isKitTypeComplete() && !prevCompleted.has("kit-type") && openAccordions.includes("kit-type")) {
      setOpenAccordions(prev => {
        const without = prev.filter(item => item !== "kit-type");
        return without.includes("enrollment") ? without : [...without, "enrollment"];
      });
    }

    // Se matrícula foi completada pela primeira vez, sugerir mensalidade
    if (isEnrollmentComplete() && !prevCompleted.has("enrollment") && openAccordions.includes("enrollment")) {
      setOpenAccordions(prev => {
        const without = prev.filter(item => item !== "enrollment");
        return without.includes("monthly-fee") ? without : [...without, "monthly-fee"];
      });
    }

    // Se mensalidade foi completada pela primeira vez, sugerir material
    if (isMonthlyFeeComplete() && !prevCompleted.has("monthly-fee") && openAccordions.includes("monthly-fee")) {
      setOpenAccordions(prev => {
        const without = prev.filter(item => item !== "monthly-fee");
        return without.includes("material") ? without : [...without, "material"];
      });
    }

    // Se material foi completado pela primeira vez, minimizar
    if (isMaterialComplete() && !prevCompleted.has("material") && openAccordions.includes("material")) {
      setOpenAccordions(prev => prev.filter(item => item !== "material"));
    }
  }, [watchedValues]);

  /**
   * LOG: Componente para indicador de completude
   */
  const CompletionIndicator = ({ isComplete }: { isComplete: boolean }) => {
    if (!isComplete) return null;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

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
   * Formatação brasileira R$ sem perda de foco durante digitação
   */
  const MoneyInput = useCallback(({ field, placeholder }: { field: any; placeholder: string }) => {
    // Estado local para manter string durante digitação
    const [localValue, setLocalValue] = useState(field.value?.toString() || "");
    
    // Sincronizar com campo do form quando valor externo mudar
    useEffect(() => {
      if (field.value !== undefined && field.value !== null) {
        setLocalValue(field.value.toString());
      } else {
        setLocalValue("");
      }
    }, [field.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      
      // Converter para número apenas se não estiver vazio
      if (inputValue === "" || inputValue === null) {
        field.onChange("");
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          field.onChange(numValue);
        }
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          className="pl-10"
          value={localValue}
          onChange={handleChange}
          onBlur={field.onBlur}
          name={field.name}
        />
      </div>
    );
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Accordion 
          type="multiple" 
          value={openAccordions} 
          onValueChange={setOpenAccordions}
          className="w-full space-y-2"
        >
          
          {/* LOG: Accordion - Tipo de Kit */}
          <AccordionItem 
            value="kit-type" 
            className={cn(
              "border rounded-lg transition-colors",
              isKitTypeComplete() && "bg-green-50/50 border-green-200"
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Tipo de Kit</span>
                <CompletionIndicator isComplete={isKitTypeComplete()} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <FormField
                control={form.control}
                name="kit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Kit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de kit" />
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
            </AccordionContent>
          </AccordionItem>

          {/* LOG: Accordion - Matrícula */}
          <AccordionItem 
            value="enrollment" 
            className={cn(
              "border rounded-lg transition-colors",
              isEnrollmentComplete() && "bg-green-50/50 border-green-200"
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Matrícula</span>
                <CompletionIndicator isComplete={isEnrollmentComplete()} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enrollment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
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
                      <FormLabel>Data Pagamento *</FormLabel>
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
                      <FormLabel>Forma *</FormLabel>
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
            </AccordionContent>
          </AccordionItem>

          {/* LOG: Accordion - Mensalidade */}
          <AccordionItem 
            value="monthly-fee" 
            className={cn(
              "border rounded-lg transition-colors",
              isMonthlyFeeComplete() && "bg-green-50/50 border-green-200"
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Mensalidade</span>
                <CompletionIndicator isComplete={isMonthlyFeeComplete()} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monthly_fee_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
                      <FormControl>
                        <MoneyInput field={field} placeholder="0,00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="first_monthly_fee_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1ª Mensalidade *</FormLabel>
                      <DatePickerField field={field} placeholder="Selecione a data" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* LOG: Accordion - Material */}
          <AccordionItem 
            value="material" 
            className={cn(
              "border rounded-lg transition-colors",
              isMaterialComplete() && "bg-green-50/50 border-green-200"
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Material</span>
                <CompletionIndicator isComplete={isMaterialComplete()} />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="material_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
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
                      <FormLabel>Data Pagamento *</FormLabel>
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
                      <FormLabel>Forma Pagamento *</FormLabel>
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
            </AccordionContent>
          </AccordionItem>

          {/* LOG: Accordion - Observações */}
          <AccordionItem value="observations" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="font-semibold">Observações</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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