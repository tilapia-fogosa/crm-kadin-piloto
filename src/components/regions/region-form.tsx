
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
});

type RegionFormData = z.infer<typeof formSchema>;

interface RegionFormProps {
  initialData?: {
    id: string;
    name: string;
    active: boolean;
  } | null;
  onClose: () => void;
}

export function RegionForm({ initialData, onClose }: RegionFormProps) {
  const { toast } = useToast();
  const form = useForm<RegionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const onSubmit = async (data: RegionFormData) => {
    try {
      if (initialData) {
        const { error } = await supabase
          .from("regions")
          .update({ name: data.name })
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "Região atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("regions")
          .insert([{ name: data.name }]);

        if (error) throw error;

        toast({
          title: "Região criada com sucesso",
        });
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar região:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar região",
        description: "Ocorreu um erro ao tentar salvar a região.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar" : "Nova"} Região</CardTitle>
        <CardDescription>
          {initialData
            ? "Altere as informações da região"
            : "Preencha as informações da nova região"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da região" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
