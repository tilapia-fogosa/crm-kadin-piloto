
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function FeesSection({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="enrollment_fee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor da Matrícula</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                  field.onChange(value);
                }}
              />
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
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                  field.onChange(value);
                }}
              />
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
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                {...field}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
