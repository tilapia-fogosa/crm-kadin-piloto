
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UserUpdateData {
  full_name: string;
  email: string;
  unitIds: string[];
  role: 'consultor' | 'franqueado' | 'admin' | 'educador' | 'gestor_pedagogico' | 'financeiro' | 'administrativo' | 'estagiario';
}

interface UpdateUserValues {
  email: string;
  full_name: string;
  unitIds: string[];
  role: 'consultor' | 'franqueado' | 'admin' | 'educador' | 'gestor_pedagogico' | 'financeiro' | 'administrativo' | 'estagiario';
}

export function useUserOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, values: UpdateUserValues) => {
    console.log('Atualizando usuário:', { userId, values });
    try {
      setIsLoading(true);
      
      // Usa a nova função update-user-units para edição
      const { data: response, error } = await supabase.functions.invoke('update-user-units', {
        body: {
          userId: userId,
          unitIds: values.unitIds,
          role: values.role
        }
      });

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar usuário",
          variant: "destructive",
        });
        return false;
      }

      console.log('Usuário atualizado com sucesso:', response);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro na operação de atualização:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    isLoading
  };
}
