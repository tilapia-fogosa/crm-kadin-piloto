import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DynamicFieldsHelper } from "./DynamicFieldsHelper";
import { useAutomationForm } from "./hooks/useAutomationForm";

const automationFormSchema = z.object({
  firstTimeOnly: z.enum(["yes", "no"]),
  delayAmount: z.coerce.number().min(1, "Tempo deve ser maior que 0"),
  delayUnit: z.enum(["minutes", "hours", "days"]),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

type AutomationFormData = z.infer<typeof automationFormSchema>;

interface ActivityType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  created: number;
  active: number;
  dispatches: number;
}

interface AutomationFormProps {
  activityType: ActivityType;
  onClose: () => void;
}

// Log: Formulário de criação de automação
export function AutomationForm({ activityType, onClose }: AutomationFormProps) {
  console.log('AutomationForm: Inicializando formulário para', activityType.name);

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      firstTimeOnly: "yes" as const,
      delayAmount: 1,
      delayUnit: "minutes" as const,
      message: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, insertDynamicField, isSubmitting } = useAutomationForm({
    form: form as any,
    activityType,
    onClose,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Somente primeira vez */}
        <FormField
          control={form.control}
          name="firstTimeOnly"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">
                Somente primeira vez da atividade?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">Não</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tempo do disparo */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Tempo do disparo após atividade
          </Label>
          <div className="flex gap-3 items-end">
            <FormField
              control={form.control}
              name="delayAmount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delayUnit"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minutes" id="minutes" />
                        <Label htmlFor="minutes">Minutos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hours" id="hours" />
                        <Label htmlFor="hours">Horas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="days" id="days" />
                        <Label htmlFor="days">Dias</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Mensagem */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">
                Mensagem a ser disparada
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Helper de campos dinâmicos */}
        <DynamicFieldsHelper 
          onInsertField={(field) => insertDynamicField(field, form.getValues("message"), form.setValue)}
        />

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar Automação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}