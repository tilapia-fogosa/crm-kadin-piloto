/**
 * LOG: Formulário completo para dados pedagógicos
 * Implementa validação com Zod e react-hook-form
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTurmas } from "../../hooks/useTurmas";
import { PedagogicalData, PedagogicalFormData } from "../../types/pedagogical-data.types";

// LOG: Schema de validação Zod
const pedagogicalDataSchema = z.object({
  turma_id: z.string().min(1, "Selecione uma turma"),
  data_aula_inaugural: z.date({
    required_error: "Selecione a data da aula inaugural",
  }),
  informacoes_onboarding: z.string().min(10, "Informe pelo menos 10 caracteres sobre o atendimento"),
});

interface PedagogicalDataFormProps {
  initialData?: PedagogicalData;
  onSubmit: (data: PedagogicalData) => void;
  isLoading?: boolean;
}

export function PedagogicalDataForm({ initialData, onSubmit, isLoading }: PedagogicalDataFormProps) {
  console.log('LOG: Renderizando PedagogicalDataForm com dados iniciais:', initialData);
  
  const { data: turmas, isLoading: isLoadingTurmas } = useTurmas();
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | undefined>(initialData?.turma_id);

  // LOG: Encontrar turma selecionada para exibir professor
  const selectedTurma = turmas?.find(t => t.turma_id === selectedTurmaId);

  const form = useForm<PedagogicalFormData>({
    resolver: zodResolver(pedagogicalDataSchema),
    defaultValues: {
      turma_id: initialData?.turma_id || "",
      data_aula_inaugural: initialData?.data_aula_inaugural ? new Date(initialData.data_aula_inaugural) : undefined,
      informacoes_onboarding: initialData?.informacoes_onboarding || "",
    },
  });

  // LOG: Atualizar turma selecionada quando mudar no form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'turma_id') {
        console.log('LOG: Turma selecionada mudou para:', value.turma_id);
        setSelectedTurmaId(value.turma_id);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: PedagogicalFormData) => {
    console.log('LOG: Submetendo dados pedagógicos:', data);
    
    const formattedData: PedagogicalData = {
      turma_id: data.turma_id,
      data_aula_inaugural: data.data_aula_inaugural.toISOString().split('T')[0],
      informacoes_onboarding: data.informacoes_onboarding,
    };
    
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* LOG: Campo de seleção de turma */}
        <FormField
          control={form.control}
          name="turma_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma Selecionada *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoadingTurmas}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {turmas?.map((turma) => (
                    <SelectItem key={turma.turma_id} value={turma.turma_id}>
                      {turma.turma_nome} {turma.turma_sala ? `- ${turma.turma_sala}` : ''} ({turma.turma_dia_semana})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecione a turma em que o aluno será matriculado
              </FormDescription>
              <FormMessage />
              
              {/* LOG: Exibir professor quando turma for selecionada */}
              {selectedTurma && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Professor(a): <span className="text-primary">{selectedTurma.professor_nome}</span>
                  </p>
                </div>
              )}
            </FormItem>
          )}
        />

        {/* LOG: Campo de data da aula inaugural */}
        <FormField
          control={form.control}
          name="data_aula_inaugural"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Aula Inaugural *</FormLabel>
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
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Data em que o aluno terá sua primeira aula
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LOG: Campo de informações de onboarding */}
        <FormField
          control={form.control}
          name="informacoes_onboarding"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dados do Atendimento *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva as informações coletadas durante o atendimento/onboarding do aluno..."
                  className="min-h-[150px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Registre observações importantes sobre o atendimento, expectativas, necessidades especiais, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LOG: Botão de submissão */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Dados Pedagógicos"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
