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

// This would come from your API in a real application
const leadSources = [
  { id: "1", name: "Facebook" },
  { id: "2", name: "Instagram" },
  { id: "3", name: "Indicação" },
];

interface LeadSourceSelectProps {
  form: UseFormReturn<LeadFormData>;
}

export function LeadSourceSelect({ form }: LeadSourceSelectProps) {
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
              {leadSources.map((source) => (
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