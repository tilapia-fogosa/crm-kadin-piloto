
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
  isEditing?: boolean;
  hidePhoneNumber?: boolean;
  clientData?: {
    meta_id?: string | null;
    age_range?: string | null;
    original_adset?: string | null;
  };
}

export function LeadFormFields({ form, isEditing = false, hidePhoneNumber = false, clientData }: LeadFormFieldsProps) {
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

      {!hidePhoneNumber && (
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
      )}

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite o email"
                type="email"
                {...field}
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

      {isEditing && clientData?.meta_id && (
        <FormItem>
          <FormLabel>ID Meta</FormLabel>
          <FormControl>
            <Input 
              value={clientData.meta_id || ''} 
              readOnly 
              disabled
              className="bg-muted"
            />
          </FormControl>
        </FormItem>
      )}

      {isEditing && clientData?.age_range && (
        <FormItem>
          <FormLabel>Faixa Etária</FormLabel>
          <FormControl>
            <Input 
              value={clientData.age_range || ''} 
              readOnly 
              disabled
              className="bg-muted"
            />
          </FormControl>
        </FormItem>
      )}

      {isEditing && clientData?.original_adset && (
        <FormItem>
          <FormLabel>Segmentação</FormLabel>
          <FormControl>
            <Input 
              value={clientData.original_adset || ''} 
              readOnly 
              disabled
              className="bg-muted"
            />
          </FormControl>
        </FormItem>
      )}
    </div>
  );
}
