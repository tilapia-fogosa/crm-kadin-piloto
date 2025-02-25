
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
  unit_id: string;
  role: 'consultor' | 'franqueado' | 'admin';
}

export function useUserOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, data: UserUpdateData, currentUnitId?: string) => {
    setIsLoading(true);
    try {
      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: data.full_name,
          email: data.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Se houver mudança na unidade ou função
      if (currentUnitId !== data.unit_id || currentUnitId === undefined) {
        // Desativar associação atual se existir
        if (currentUnitId) {
          const { error: deactivateError } = await supabase
            .from('unit_users')
            .update({ active: false })
            .eq('user_id', userId)
            .eq('unit_id', currentUnitId);

          if (deactivateError) throw deactivateError;
        }

        // Criar nova associação
        const { error: createError } = await supabase
          .from('unit_users')
          .insert({
            user_id: userId,
            unit_id: data.unit_id,
            role: data.role,
            active: true
          });

        if (createError) throw createError;
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] });

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o usuário",
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
