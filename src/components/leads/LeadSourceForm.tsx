
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

interface LeadSourceFormProps {
  onClose: () => void;
  initialData?: LeadSource | null;
}

// Schema de validação para o formulário
const leadSourceSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  id: z.string()
    .min(3, "O ID deve ter pelo menos 3 caracteres")
    .max(30, "O ID deve ter no máximo 30 caracteres")
    .regex(/^[a-z0-9-]+$/, "O ID deve conter apenas letras minúsculas, números e hífens")
    .transform(val => val.toLowerCase()),
  description: z.string().optional(),
});

type LeadSourceFormValues = z.infer<typeof leadSourceSchema>;

export function LeadSourceForm({ onClose, initialData }: LeadSourceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para gerar ID a partir do nome
  const generateIdFromName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30);
  };

  // Inicializar o formulário com os valores padrão ou valores existentes
  const form = useForm<LeadSourceFormValues>({
    resolver: zodResolver(leadSourceSchema),
    defaultValues: {
      name: initialData?.name || "",
      id: initialData?.id || "",
      description: "",
    },
  });

  // Quando o nome mudar, atualizar o ID sugerido (apenas se for um novo registro)
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && !initialData && value.name) {
        const suggestedId = generateIdFromName(value.name);
        form.setValue("id", suggestedId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const onSubmit = async (values: LeadSourceFormValues) => {
    console.log("Salvando origem de lead:", values);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para realizar esta ação.",
        });
        return;
      }

      if (initialData) {
        console.log(`Atualizando origem existente: ${initialData.id}`);
        const { error } = await supabase
          .from('lead_sources')
          .update({ 
            name: values.name,
          })
          .eq('id', initialData.id);

        if (error) throw error;
        
        toast({
          title: "Origem atualizada!",
          description: `A origem "${values.name}" foi atualizada com sucesso.`,
        });
      } else {
        console.log(`Criando nova origem: ${values.id}`);
        const { error } = await supabase
          .from('lead_sources')
          .insert([{ 
            id: values.id, 
            name: values.name,
            created_by: session.session.user.id,
            is_system: false
          }]);

        if (error) {
          // Verificar se é erro de duplicidade
          if (error.code === '23505') {
            toast({
              variant: "destructive",
              title: "Origem já existe",
              description: `Uma origem com o ID "${values.id}" já existe no sistema.`,
            });
            return;
          }
          throw error;
        }
        
        toast({
          title: "Origem adicionada!",
          description: `A origem "${values.name}" foi adicionada com sucesso.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar origem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar origem",
        description: "Ocorreu um erro ao tentar salvar a origem do lead.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Origem</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Facebook Ads" {...field} />
              </FormControl>
              <FormDescription>
                Nome que será exibido nas listas de origens de leads.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID da Origem</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: facebook-ads" 
                  {...field} 
                  disabled={!!initialData}
                />
              </FormControl>
              <FormDescription>
                {initialData 
                  ? "O ID não pode ser alterado após a criação."
                  : "Identificador único usado nas integrações. Apenas letras minúsculas, números e hífens."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
