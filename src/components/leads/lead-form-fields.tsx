import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "@/types/lead-form";
import { LeadSourceSelect } from "./lead-source-select";

interface LeadFormFieldsProps {
  form: UseFormReturn<LeadFormData>;
}

export function LeadFormFields({ form }: LeadFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
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
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input
                placeholder="DDD + número (apenas números)"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  field.onChange(value);
                }}
                maxLength={11}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LeadSourceSelect form={form} />

      <FormField
        control={form.control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Digite as observações sobre o cliente"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ageRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Faixa Etária</FormLabel>
            <FormControl>
              <Input placeholder="Digite a faixa etária" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ID Meta</FormLabel>
            <FormControl>
              <Input placeholder="Digite o ID da Meta" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="originalAd"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anúncio de Origem</FormLabel>
            <FormControl>
              <Input placeholder="Digite o anúncio de origem" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}