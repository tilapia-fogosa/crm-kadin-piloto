
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Definir os esquemas de formulário para cada tipo de operação
const renameUserSchema = z.object({
  operation: z.literal("rename-user"),
  oldEmail: z.string().email("Email inválido"),
  newEmail: z.string().email("Email inválido"),
  fullName: z.string().optional(),
});

const deactivateUserSchema = z.object({
  operation: z.literal("deactivate-user"),
  email: z.string().email("Email inválido"),
});

const mergeUsersSchema = z.object({
  operation: z.literal("merge-users"),
  sourceEmail: z.string().email("Email inválido"),
  targetEmail: z.string().email("Email inválido"),
});

// União dos esquemas para validação condicional
const formSchema = z.discriminatedUnion("operation", [
  renameUserSchema,
  deactivateUserSchema,
  mergeUsersSchema,
]);

type FormValues = z.infer<typeof formSchema>;

export function UserAccountsManager() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<
    "rename-user" | "deactivate-user" | "merge-users" | ""
  >("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: "rename-user" as const,
      oldEmail: "",
      newEmail: "",
      fullName: "",
    },
  });

  // Atualizar o tipo de operação no formulário quando a seleção mudar
  const handleOperationChange = (value: string) => {
    setOperationType(value as any);
    form.setValue("operation", value as any);
    form.reset({
      operation: value as any,
    });
  };

  const onSubmit = async (values: FormValues) => {
    console.log("Enviando formulário:", values);
    setIsSubmitting(true);

    try {
      // Chamar a Edge Function para gerenciar contas de usuário
      const { data, error } = await supabase.functions.invoke("manage-user-accounts", {
        body: values,
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        throw new Error(error.message || "Ocorreu um erro durante a operação");
      }

      console.log("Resposta da Edge Function:", data);
      toast({
        title: "Operação realizada com sucesso",
        description: data.result?.message || "A operação foi concluída com êxito",
      });

      // Limpar formulário após sucesso
      form.reset({
        operation: operationType as any,
      });
    } catch (error: any) {
      console.error("Erro ao processar operação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar a operação",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gerenciamento de Contas de Usuário</CardTitle>
        <CardDescription>
          Realize operações administrativas nas contas de usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tipo de Operação</label>
          <Select onValueChange={handleOperationChange} value={operationType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rename-user">Renomear Usuário</SelectItem>
              <SelectItem value="deactivate-user">Desativar Usuário</SelectItem>
              <SelectItem value="merge-users">Mesclar Usuários</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {operationType && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {operationType === "rename-user" && (
                <>
                  <FormField
                    control={form.control}
                    name="oldEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Atual</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="usuario@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Novo Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="novoemail@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome Completo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {operationType === "deactivate-user" && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Usuário</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="usuario@exemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {operationType === "merge-users" && (
                <>
                  <FormField
                    control={form.control}
                    name="sourceEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Usuário Fonte (a ser mesclado)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="origem@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Usuário Alvo (destino)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="destino@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Executar Operação"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
