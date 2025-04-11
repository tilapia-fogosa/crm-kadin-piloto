import React, { useEffect } from "react";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

const LeadSourcesTable = () => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      console.log('Buscando sessão atual do usuário');
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: leadSources, isLoading, isError, error } = useQuery({
    queryKey: ['leadSources'],
    queryFn: async () => {
      console.log('Buscando origens de leads');
      if (!session) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching lead sources:', error);
        throw error;
      }
      console.log('Origens recuperadas:', data);
      return data as LeadSource[];
    },
    enabled: !!session,
  });

  useEffect(() => {
    console.log('LeadSourcesTable montado, recarregando dados...');
    if (session) {
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
    }
  }, [session, queryClient]);

  const handleDelete = async (source: LeadSource) => {
    try {
      console.log(`Tentando remover origem: ${source.id}`);
      const { error } = await supabase
        .from('lead_sources')
        .delete()
        .eq('id', source.id);

      if (error) {
        console.error('Erro ao deletar origem:', error);
        throw error;
      }

      console.log('Origem removida com sucesso');
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
    return <div className="flex justify-center p-8">Carregando origens...</div>;
  }

  if (isError) {
    return (
      <div className="bg-destructive/20 p-4 rounded-md">
        <p className="font-semibold text-destructive">Erro ao carregar origens de leads:</p>
        <p>{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    );
  }

  if (!session) {
    return <div className="p-4 bg-secondary rounded-md">Por favor, faça login para acessar esta página.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Origens dos Leads</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
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
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadSources?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhuma origem cadastrada. Clique em "Adicionar Origem" para começar.
              </TableCell>
            </TableRow>
          ) : (
            leadSources?.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-mono text-sm">{source.id}</TableCell>
                <TableCell>{source.name}</TableCell>
                <TableCell>
                  {source.is_system ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="text-white bg-[#222222]">Sistema</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Origens do sistema são pré-definidas e não podem ser removidas
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="outline">Personalizada</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <LeadSourceActions 
                    source={source} 
                    onDelete={handleDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadSourcesTable;
