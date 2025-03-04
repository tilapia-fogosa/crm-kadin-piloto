
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
}

interface UserUpdateData {
  full_name: string;
  email: string;
  unitIds: string[];
  role: 'consultor' | 'franqueado' | 'admin' | 'educador' | 'gestor_pedagogico';
}

interface UpdateUserValues {
  email: string;
  full_name: string;
  unitIds: string[];
  role: 'consultor' | 'franqueado' | 'admin' | 'educador' | 'gestor_pedagogico';
}

export function useUserOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, values: UpdateUserValues) => {
    console.log('Atualizando usuário:', { userId, values });
    try {
      // Chama a função RPC do Supabase para criar/atualizar usuário
      const { data: updatedUserId, error: createError } = await supabase.rpc(
        'create_unit_user',
        {
          p_email: values.email,
          p_full_name: values.full_name,
          p_unit_ids: values.unitIds,
          p_role: values.role
        }
      );

      if (createError) {
        console.error('Erro ao atualizar usuário:', createError);
        toast({
          title: "Erro",
          description: createError.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('Usuário atualizado com sucesso:', updatedUserId);
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
    }
  };

  return {
    updateUser,
    isLoading
  };
}
