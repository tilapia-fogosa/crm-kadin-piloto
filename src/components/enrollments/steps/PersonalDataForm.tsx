import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Student } from "@/types/enrollment";
import { useEnrollmentForm } from "../EnrollmentFormProvider";
import { parseFormDate, formatDateForInput } from "@/utils/date";

const personalDataSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().optional(),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  address_postal_code: z.string().min(8, "CEP inválido"),
  address_street: z.string().min(3, "Endereço é obrigatório"),
  address_number: z.string().min(1, "Número é obrigatório"),
  address_neighborhood: z.string().min(1, "Bairro é obrigatório"),
  address_city: z.string().min(1, "Cidade é obrigatória"),
  address_state: z.string().min(2, "Estado é obrigatório"),
});

type PersonalDataForm = z.infer<typeof personalDataSchema>;

export function PersonalDataForm() {
  const { state, updateFormData } = useEnrollmentForm();
  console.log('Rendering PersonalDataForm with state:', state);

  const form = useForm<PersonalDataForm>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      full_name: state.formData.full_name || '',
      cpf: state.formData.cpf || '',
      rg: state.formData.rg || '',
      birth_date: state.formData.birth_date ? formatDateForInput(state.formData.birth_date) : '',
      address_postal_code: state.formData.address_postal_code || '',
      address_street: state.formData.address_street || '',
      address_number: state.formData.address_number || '',
      address_neighborhood: state.formData.address_neighborhood || '',
      address_city: state.formData.address_city || '',
      address_state: state.formData.address_state || '',
    }
  });

  const onSubmit = (data: PersonalDataForm) => {
    console.log('Form submitted:', data);
    updateFormData({
      ...data,
      birth_date: parseFormDate(data.birth_date)
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
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
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>RG</FormLabel>
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
          name="birth_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  placeholder="dd/mm/aaaa"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
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
            name="address_number"
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

          <FormField
            control={form.control}
            name="address_neighborhood"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address_city"
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
            name="address_state"
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
      </form>
    </Form>
  );
}
