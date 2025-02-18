
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Função de validação de CNPJ
function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14) return false;

  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === Number(digitos.charAt(1));
}

const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company_name: z.string().min(1, "Razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido").refine(isValidCNPJ, "CNPJ inválido"),
  trading_name: z.string().optional(),
  region_id: z.string().min(1, "Região é obrigatória"),
  enrollment_fee: z.string().optional(),
  material_fee: z.string().optional(),
  monthly_fee: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  legal_representative: z.string().optional(),
  // Campos de endereço
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postal_code: z.string().min(8, "CEP inválido"),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function UnitForm({ onSuccess, initialData, isEditing = false }: UnitFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: initialData || {
      name: "",
      company_name: "",
      cnpj: "",
      trading_name: "",
      region_id: "",
      enrollment_fee: "",
      material_fee: "",
      monthly_fee: "",
      email: "",
      phone: "",
      legal_representative: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
    },
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(data: UnitFormData) {
    try {
      if (isEditing) {
        // Atualiza a unidade
        const { error: unitError } = await supabase
          .from('units')
          .update({
            name: data.name,
            company_name: data.company_name,
            cnpj: data.cnpj,
            trading_name: data.trading_name || null,
            region_id: data.region_id,
            enrollment_fee: data.enrollment_fee ? parseFloat(data.enrollment_fee) : null,
            material_fee: data.material_fee ? parseFloat(data.material_fee) : null,
            monthly_fee: data.monthly_fee ? parseFloat(data.monthly_fee) : null,
            email: data.email || null,
            phone: data.phone || null,
            legal_representative: data.legal_representative || null,
          })
          .eq('id', initialData.id);

        if (unitError) throw unitError;

        // Atualiza o endereço
        const { error: addressError } = await supabase
          .from('unit_addresses')
          .update({
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
          })
          .eq('unit_id', initialData.id);

        if (addressError) throw addressError;
      } else {
        // Insere a unidade
        const { data: unit, error: unitError } = await supabase
          .from('units')
          .insert({
            name: data.name,
            company_name: data.company_name,
            cnpj: data.cnpj,
            trading_name: data.trading_name || null,
            region_id: data.region_id,
            enrollment_fee: data.enrollment_fee ? parseFloat(data.enrollment_fee) : null,
            material_fee: data.material_fee ? parseFloat(data.material_fee) : null,
            monthly_fee: data.monthly_fee ? parseFloat(data.monthly_fee) : null,
            email: data.email || null,
            phone: data.phone || null,
            legal_representative: data.legal_representative || null,
          })
          .select()
          .single();

        if (unitError) throw unitError;

        // Insere o endereço
        const { error: addressError } = await supabase
          .from('unit_addresses')
          .insert({
            unit_id: unit.id,
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
          });

        if (addressError) throw addressError;
      }

      await queryClient.invalidateQueries({ queryKey: ['units'] });
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Unidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão Social</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Região</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione uma região</option>
                    {regions?.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enrollment_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Matrícula</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="material_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Material</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthly_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Mensalidade</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
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
              name="complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="neighborhood"
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
              name="city"
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
              name="state"
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

            <FormField
              control={form.control}
              name="postal_code"
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
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
