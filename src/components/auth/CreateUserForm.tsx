import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MultipleUnitSelect } from "./MultipleUnitSelect";

const formSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["consultor", "franqueado", "admin", "educador", "gestor_pedagogico", "financeiro", "administrativo", "estagiario"]),
  unitIds: z.array(z.string()).min(1, "Selecione pelo menos uma unidade"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      unitIds: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting form with values:', values);
    setLoading(true);
    
    try {
      console.log('Calling create-user function');
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          unitIds: values.unitIds,
        },
      });

      if (error) {
        console.error('Error from create-user function:', error);
        throw error;
      }

      console.log('User created successfully:', data);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="consultor">Consultor</SelectItem>
                  <SelectItem value="franqueado">Franqueado</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="educador">Educador</SelectItem>
                  <SelectItem value="gestor_pedagogico">Gestor Pedagógico</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="estagiario">Estagiário</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidades</FormLabel>
              <FormControl>
                <MultipleUnitSelect
                  selectedUnits={field.value}
                  onUnitsChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Usuário"
          )}
        </Button>
      </form>
    </Form>
  );
}
