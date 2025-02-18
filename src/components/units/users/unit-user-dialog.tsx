
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["consultor", "franqueado", "admin"], {
    required_error: "Selecione uma função",
  }),
});

interface UnitUserDialogProps {
  unit: any;
  user?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitUserDialog({ unit, user, open, onOpenChange }: UnitUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!user;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.user?.full_name || "",
      email: user?.user?.email || "",
      role: user?.role || "consultor",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase.rpc('create_unit_user', {
        p_email: values.email,
        p_full_name: values.full_name,
        p_unit_id: unit.id,
        p_role: values.role,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      toast({
        title: "Usuário criado",
        description: "Usuário criado com sucesso. A senha inicial é: mudar123",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao criar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from('unit_users')
        .update({ role: values.role })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      toast({
        title: "Usuário atualizado",
        description: "Função do usuário atualizada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro ao atualizar a função do usuário.",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEditing} />
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
                    <Input {...field} type="email" disabled={isEditing} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="consultor">Consultor</SelectItem>
                      <SelectItem value="franqueado">Franqueado</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
