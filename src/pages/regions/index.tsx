
import { RegionsTable } from "@/components/regions/regions-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const regionFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export default function RegionsPage() {
  const [showNewRegionDialog, setShowNewRegionDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof regionFormSchema>>({
    resolver: zodResolver(regionFormSchema),
  });

  const handleDelete = async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .update({ active: false })
        .eq('id', regionId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['regions'] });
      
      toast({
        title: "Região removida",
        description: "A região foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover região:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover a região.",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof regionFormSchema>) => {
    try {
      const { error } = await supabase
        .from('regions')
        .insert({ name: values.name });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setShowNewRegionDialog(false);
      form.reset();
      
      toast({
        title: "Região criada",
        description: "A região foi criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar região:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar",
        description: "Ocorreu um erro ao tentar criar a região.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Regiões</h1>
        <Button onClick={() => setShowNewRegionDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Região
        </Button>
      </div>

      <Dialog open={showNewRegionDialog} onOpenChange={setShowNewRegionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Região</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Região</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <RegionsTable
        onEdit={() => {}}
        onDelete={handleDelete}
      />
    </div>
  );
}
