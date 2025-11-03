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
import { useTurmas } from "../../hooks/useTurmas";
import { useUnit } from "@/contexts/UnitContext";
import { PedagogicalData, PedagogicalFormData } from "../../types/pedagogical-data.types";
import { AulaInauguralScheduler } from "../AulaInauguralScheduler";

// LOG: Schema de validação Zod (com campos de aula inaugural)
const pedagogicalDataSchema = z.object({
  turma_id: z.string().min(1, "Selecione uma turma"),
  data_aula_inaugural: z.date({
    required_error: "Selecione a data e horário da aula inaugural",
  }),
  informacoes_onboarding: z.string().min(10, "Informe pelo menos 10 caracteres sobre o atendimento"),
  aula_inaugural_professor_id: z.string().optional(),
  aula_inaugural_sala_id: z.string().optional(),
  aula_inaugural_horario_inicio: z.string().optional(),
  aula_inaugural_horario_fim: z.string().optional(),
});

interface PedagogicalDataFormProps {
  initialData?: PedagogicalData;
  onSubmit: (data: PedagogicalData) => void;
  isLoading?: boolean;
}

export function PedagogicalDataForm({ initialData, onSubmit, isLoading }: PedagogicalDataFormProps) {
  console.log('LOG: Renderizando PedagogicalDataForm com dados iniciais:', initialData);
  
  const { data: turmas, isLoading: isLoadingTurmas } = useTurmas();
  const { selectedUnitId } = useUnit();
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
    console.log('LOG: Submetendo dados pedagógicos com aula inaugural:', data);
    
    // Validar se horário da aula inaugural foi selecionado
    if (!data.aula_inaugural_horario_inicio || !data.aula_inaugural_professor_id || !data.aula_inaugural_sala_id) {
      console.error('LOG: Dados de aula inaugural incompletos');
      return;
    }
    
    const formattedData: any = {
      turma_id: data.turma_id,
      data_aula_inaugural: data.data_aula_inaugural.toISOString().split('T')[0],
      informacoes_onboarding: data.informacoes_onboarding,
      // Incluir dados da aula inaugural para processamento
      aula_inaugural_professor_id: data.aula_inaugural_professor_id,
      aula_inaugural_sala_id: data.aula_inaugural_sala_id,
      aula_inaugural_horario_inicio: data.aula_inaugural_horario_inicio,
      aula_inaugural_horario_fim: data.aula_inaugural_horario_fim,
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

        {/* LOG: Agendamento de aula inaugural com professor e sala */}
        <div className="space-y-2">
          <FormLabel>Data e Horário da Aula Inaugural *</FormLabel>
          <FormDescription className="text-xs mb-3">
            Selecione uma data e horário disponível. O sistema encontrará automaticamente um professor e sala disponíveis.
          </FormDescription>
          
          {selectedUnitId ? (
            <AulaInauguralScheduler
              unitId={selectedUnitId}
              initialDate={form.getValues('data_aula_inaugural')}
              onSelectSlot={(slot) => {
                console.log('LOG: Slot de aula inaugural selecionado:', slot);
                form.setValue('data_aula_inaugural', slot.data);
                form.setValue('aula_inaugural_professor_id', slot.professor_id);
                form.setValue('aula_inaugural_sala_id', slot.sala_id);
                form.setValue('aula_inaugural_horario_inicio', slot.horario_inicio);
                form.setValue('aula_inaugural_horario_fim', slot.horario_fim);
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma unidade para ver os horários disponíveis</p>
          )}
          
          {form.formState.errors.data_aula_inaugural && (
            <p className="text-sm text-destructive">{form.formState.errors.data_aula_inaugural.message}</p>
          )}
        </div>

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
