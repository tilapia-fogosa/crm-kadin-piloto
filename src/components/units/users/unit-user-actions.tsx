
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnitUserActionsProps {
  user: any;
  onEdit: () => void;
}

export function UnitUserActions({ user, onEdit }: UnitUserActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleActiveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('unit_users')
        .update({ active: !user.active })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      toast({
        title: "Usuário atualizado",
        description: `Usuário ${user.active ? 'desativado' : 'ativado'} com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro ao atualizar o status do usuário.",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleActiveMutation.mutate()}>
          <Power className="mr-2 h-4 w-4" />
          {user.active ? "Desativar" : "Ativar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
