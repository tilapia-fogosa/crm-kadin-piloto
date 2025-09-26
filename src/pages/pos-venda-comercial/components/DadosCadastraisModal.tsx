import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDateForInput } from "@/utils/date/formatting";

const cadastraisSchema = z.object({
  full_name: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birth_date: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
});

type CadastraisFormData = z.infer<typeof cadastraisSchema>;

interface DadosCadastraisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

export function DadosCadastraisModal({ isOpen, onClose, activityId }: DadosCadastraisModalProps) {
  const queryClient = useQueryClient();

  // LOG: Estado para controle dos accordions e seções completadas
  const [openAccordions, setOpenAccordions] = useState<string[]>(["dados-pessoais"]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const form = useForm<CadastraisFormData>({
    resolver: zodResolver(cadastraisSchema),
    defaultValues: {
      full_name: "",
      cpf: "",
      rg: "",
      birth_date: "",
      address_postal_code: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
    },
  });

  // LOG: Observar mudanças nos campos do formulário
  const watchedValues = useWatch({ control: form.control });

  // Buscar dados atuais da atividade
  const { data: activity } = useQuery({
    queryKey: ['pos-venda-activity', activityId],
    queryFn: async () => {
      console.log('LOG: Buscando dados da atividade para modal cadastrais:', activityId);

      const { data, error } = await supabase
        .from('atividade_pos_venda')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) {
        console.error('LOG: Erro ao buscar atividade:', error);
        throw error;
      }

      return data;
    },
    enabled: isOpen && !!activityId,
  });

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (activity) {
      console.log('LOG: Preenchendo formulário com dados existentes:', activity);
      
      form.reset({
        full_name: activity.full_name || "",
        cpf: activity.cpf || "",
        rg: activity.rg || "",
        birth_date: activity.birth_date || "",
        address_postal_code: activity.address_postal_code || "",
        address_street: activity.address_street || "",
        address_number: activity.address_number || "",
        address_complement: activity.address_complement || "",
        address_neighborhood: activity.address_neighborhood || "",
        address_city: activity.address_city || "",
        address_state: activity.address_state || "",
      });
    }
  }, [activity, form]);

  /**
   * LOG: Funções para verificar completude de cada seção
   */
  const isPersonalDataComplete = () => {
    return !!(
      watchedValues.full_name &&
      watchedValues.birth_date &&
      watchedValues.cpf &&
      watchedValues.rg
    );
  };

  const isAddressComplete = () => {
    return !!(
      watchedValues.address_postal_code &&
      watchedValues.address_street &&
      watchedValues.address_number &&
      watchedValues.address_neighborhood &&
      watchedValues.address_city &&
      watchedValues.address_state
    );
  };

  /**
   * LOG: Efeito para definir estado inicial dos accordions baseado na completude
   * Seções INCOMPLETAS ficam ABERTAS, seções COMPLETAS ficam FECHADAS
   */
  useEffect(() => {
    if (!isOpen || !activity) return;

    const personalComplete = isPersonalDataComplete();
    const addressComplete = isAddressComplete();
    
    console.log('LOG: Definindo estado inicial dos accordions:', {
      personalComplete,
      addressComplete,
      modal: 'aberto'
    });

    let initialAccordions: string[] = [];

    // Lógica: seções incompletas ficam abertas
    if (!personalComplete) {
      initialAccordions.push("dados-pessoais");
    }
    
    if (!addressComplete && personalComplete) {
      initialAccordions.push("endereco");
    }

    // Se ambas incompletas, priorizar dados pessoais
    if (!personalComplete && !addressComplete) {
      initialAccordions = ["dados-pessoais"];
    }

    // Se ambas completas, nenhuma aberta
    if (personalComplete && addressComplete) {
      initialAccordions = [];
    }

    console.log('LOG: Accordions que devem ficar abertos:', initialAccordions);
    setOpenAccordions(initialAccordions);
  }, [isOpen, activity]);

  /**
   * LOG: Efeito para atualizar seções completadas e sugestões durante preenchimento
   */
  useEffect(() => {
    const newCompletedSections = new Set<string>();
    
    // Marcar seções completadas
    if (isPersonalDataComplete()) newCompletedSections.add("dados-pessoais");
    if (isAddressComplete()) newCompletedSections.add("endereco");
    
    setCompletedSections(newCompletedSections);

    // Lógica de sugestão automática durante preenchimento ativo
    const prevCompleted = completedSections;
    
    // Se dados pessoais foi completado pela primeira vez, sugerir endereço
    if (isPersonalDataComplete() && !prevCompleted.has("dados-pessoais") && openAccordions.includes("dados-pessoais")) {
      setOpenAccordions(prev => {
        const without = prev.filter(item => item !== "dados-pessoais");
        return without.includes("endereco") ? without : [...without, "endereco"];
      });
    }

    // Se endereço foi completado pela primeira vez, minimizar
    if (isAddressComplete() && !prevCompleted.has("endereco") && openAccordions.includes("endereco")) {
      setOpenAccordions(prev => prev.filter(item => item !== "endereco"));
    }
  }, [watchedValues]);

  /**
   * LOG: Componente para indicador de completude
   */
  const CompletionIndicator = ({ isComplete }: { isComplete: boolean }) => {
    if (!isComplete) return null;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

  // Mutation para salvar dados
  const saveMutation = useMutation({
    mutationFn: async (data: CadastraisFormData) => {
      console.log('LOG: Salvando dados cadastrais:', data);

      const { error } = await supabase
        .from('atividade_pos_venda')
        .update(data)
        .eq('id', activityId);

      if (error) {
        console.error('LOG: Erro ao salvar dados cadastrais:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('LOG: Dados cadastrais salvos com sucesso');
      queryClient.invalidateQueries({ queryKey: ['pos-venda-activities'] });
      queryClient.invalidateQueries({ queryKey: ['pos-venda-activity', activityId] });
      toast({
        title: "Dados salvos",
        description: "Os dados cadastrais foram salvos com sucesso.",
      });
      onClose();
    },
    onError: (error) => {
      console.error('LOG: Erro ao salvar dados cadastrais:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados cadastrais. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CadastraisFormData) => {
    console.log('LOG: Submetendo formulário de dados cadastrais:', data);
    saveMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Dados Cadastrais do Aluno
          </DialogTitle>
          <DialogDescription>
            Preencha as informações pessoais e de endereço do aluno.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Accordion 
              type="multiple" 
              value={openAccordions} 
              onValueChange={setOpenAccordions}
              className="w-full space-y-2"
            >
              
              {/* LOG: Accordion - Dados Pessoais */}
              <AccordionItem 
                value="dados-pessoais" 
                className={cn(
                  "border rounded-lg transition-colors",
                  isPersonalDataComplete() && "bg-green-50/50 border-green-200"
                )}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Dados Pessoais</span>
                    <CompletionIndicator isComplete={isPersonalDataComplete()} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value ? formatDateForInput(new Date(field.value)) : ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG *</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* LOG: Accordion - Endereço */}
              <AccordionItem 
                value="endereco" 
                className={cn(
                  "border rounded-lg transition-colors",
                  isAddressComplete() && "bg-green-50/50 border-green-200"
                )}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Endereço</span>
                    <CompletionIndicator isComplete={isAddressComplete()} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address_postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP *</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_street"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Logradouro *</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, Avenida, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_complement"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto, Bloco, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address_neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro *</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_city"  
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado *</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar Dados"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}