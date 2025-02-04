import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "@/types/lead-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadSourceSelectProps {
  form: UseFormReturn<LeadFormData>;
}

export function LeadSourceSelect({ form }: LeadSourceSelectProps) {
  const { data: leadSources, isLoading } = useQuery({
    queryKey: ['leadSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <FormField
      control={form.control}
      name="leadSource"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Origem do Lead *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem do lead" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {leadSources?.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}