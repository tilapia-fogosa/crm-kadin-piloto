
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEnrollmentForm } from "../EnrollmentFormProvider";
import { parseFormDate, formatDateForInput } from "@/utils/dateUtils";

const financialResponsibleSchema = z.object({
  is_own_financial_responsible: z.boolean(),
  responsible_full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  responsible_cpf: z.string().min(11, "CPF inválido").optional(),
  responsible_birth_date: z.string().optional(),
  responsible_profession: z.string().optional(),
  responsible_email: z.string().email("Email inválido").optional(),
  responsible_phone: z.string().min(10, "Telefone inválido").optional(),
  responsible_postal_code: z.string().min(8, "CEP inválido").optional(),
  responsible_street: z.string().min(3, "Endereço é obrigatório").optional(),
  responsible_number: z.string().min(1, "Número é obrigatório").optional(),
  responsible_neighborhood: z.string().min(1, "Bairro é obrigatório").optional(),
  responsible_city: z.string().min(1, "Cidade é obrigatória").optional(),
  responsible_state: z.string().min(2, "Estado é obrigatório").optional(),
  use_student_address: z.boolean(),
}).superRefine((data, ctx) => {
  if (!data.is_own_financial_responsible) {
    if (!data.responsible_full_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome do responsável é obrigatório",
        path: ["responsible_full_name"]
      });
    }
    if (!data.responsible_cpf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF do responsável é obrigatório",
        path: ["responsible_cpf"]
      });
    }
    // Adiciona mais validações condicionais para outros campos
  }
});

type FinancialResponsibleForm = z.infer<typeof financialResponsibleSchema>;

export function FinancialResponsibleForm() {
  const { state, updateFormData } = useEnrollmentForm();
  console.log('Rendering FinancialResponsibleForm with state:', state);

  const form = useForm<FinancialResponsibleForm>({
    resolver: zodResolver(financialResponsibleSchema),
    defaultValues: {
      is_own_financial_responsible: state.formData.is_own_financial_responsible ?? true,
      responsible_full_name: state.formData.responsible_full_name || '',
      responsible_cpf: state.formData.responsible_cpf || '',
      responsible_birth_date: state.formData.responsible_birth_date ? formatDateForInput(state.formData.responsible_birth_date) : '',
      responsible_profession: state.formData.responsible_profession || '',
      responsible_email: state.formData.responsible_email || '',
      responsible_phone: state.formData.responsible_phone || '',
      responsible_postal_code: state.formData.responsible_postal_code || '',
      responsible_street: state.formData.responsible_street || '',
      responsible_number: state.formData.responsible_number || '',
      responsible_neighborhood: state.formData.responsible_neighborhood || '',
      responsible_city: state.formData.responsible_city || '',
      responsible_state: state.formData.responsible_state || '',
      use_student_address: false,
    }
  });

  const isOwnResponsible = form.watch('is_own_financial_responsible');
  const useStudentAddress = form.watch('use_student_address');

  const onSubmit = (data: FinancialResponsibleForm) => {
    console.log('Financial Responsible Form submitted:', data);
    
    // Se for o próprio responsável, limpa os dados do responsável
    if (data.is_own_financial_responsible) {
      updateFormData({
        is_own_financial_responsible: true,
        responsible_full_name: undefined,
        responsible_cpf: undefined,
        responsible_birth_date: undefined,
        responsible_profession: undefined,
        responsible_email: undefined,
        responsible_phone: undefined,
        responsible_postal_code: undefined,
        responsible_street: undefined,
        responsible_number: undefined,
        responsible_neighborhood: undefined,
        responsible_city: undefined,
        responsible_state: undefined,
      });
      return;
    }

    // Se usar o endereço do aluno, copia os dados
    if (data.use_student_address) {
      data.responsible_postal_code = state.formData.address_postal_code;
      data.responsible_street = state.formData.address_street;
      data.responsible_number = state.formData.address_number;
      data.responsible_neighborhood = state.formData.address_neighborhood;
      data.responsible_city = state.formData.address_city;
      data.responsible_state = state.formData.address_state;
    }

    updateFormData({
      ...data,
      responsible_birth_date: parseFormDate(data.responsible_birth_date),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="is_own_financial_responsible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aluno é o próprio responsável financeiro
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {!isOwnResponsible && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible_full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible_birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento do Responsável</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible_profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Responsável</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="use_student_address"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Usar mesmo endereço do aluno
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!useStudentAddress && (
              <>
                <FormField
                  control={form.control}
                  name="responsible_postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsible_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço do Responsável</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsible_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="responsible_neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsible_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsible_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </>
        )}

        <Button type="submit">
          Salvar e Continuar
        </Button>
      </form>
    </Form>
  );
}
