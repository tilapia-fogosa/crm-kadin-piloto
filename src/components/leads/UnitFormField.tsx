
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUnit } from "@/contexts/UnitContext";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "@/types/lead-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface UnitFormFieldProps {
  form: UseFormReturn<LeadFormData>;
}

export function UnitFormField({ form }: UnitFormFieldProps) {
  const { availableUnits, isLoading } = useUnit();

  // Auto-select unit if there's only one available
  useEffect(() => {
    console.log("Checking for auto-select unit condition");
    if (availableUnits.length === 1 && !form.getValues().unitId) {
      console.log("Auto-selecting single available unit:", availableUnits[0].unit_id);
      form.setValue("unitId", availableUnits[0].unit_id);
    }
  }, [availableUnits, form]);

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Unidade</FormLabel>
        <FormControl>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Carregando unidades..." />
            </SelectTrigger>
          </Select>
        </FormControl>
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="unitId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Unidade *</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unitUser) => (
                  <SelectItem key={unitUser.unit_id} value={unitUser.unit_id}>
                    {unitUser.unit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
