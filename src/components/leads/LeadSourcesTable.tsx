```typescript
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LeadSourceForm } from "./LeadSourceForm";
import { LeadSourceActions } from "./LeadSourceActions";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

export default function LeadSourcesTable() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: leadSources, isLoading } = useQuery({
    queryKey: ['leadSources'],
    queryFn: async () => {
      if (!session) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching lead sources:', error);
        throw error;
      }
      return data as LeadSource[];
    },
    enabled: !!session,
  });

  const handleDelete = async (source: LeadSource) => {
    try {
      const { error } = await supabase
        .from('lead_sources')
        .delete()
        .eq('id', source.id);

      if (error) throw error;

      toast({
        title: "Origem removida com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
    } catch (error) {
      console.error('Erro ao deletar origem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover origem",
        description: "Ocorreu um erro ao tentar remover a origem do lead.",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return <div>Por favor, faça login para acessar esta página.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Origens dos Leads</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" />
              Adicionar Origem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Origem</DialogTitle>
            </DialogHeader>
            <LeadSourceForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadSources?.map((source) => (
            <TableRow key={source.id}>
              <TableCell>{source.name}</TableCell>
              <TableCell>
                <LeadSourceActions 
                  source={source} 
                  onDelete={handleDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```
