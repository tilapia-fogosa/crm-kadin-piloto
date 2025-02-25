
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
  role: 'consultor' | 'franqueado' | 'admin';
}

export function useUserOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, data: UserUpdateData) => {
    console.log('Iniciando atualização do usuário:', { userId, data });
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

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }
      console.log('Perfil atualizado com sucesso');

      // Buscar unidades ativas atuais do usuário
      const { data: currentUnitUsers, error: fetchError } = await supabase
        .from('unit_users')
        .select('unit_id')
        .eq('user_id', userId)
        .eq('active', true);

      if (fetchError) {
        console.error('Erro ao buscar unidades atuais:', fetchError);
        throw fetchError;
      }
      console.log('Unidades atuais recuperadas:', currentUnitUsers);

      const currentUnitIds = currentUnitUsers?.map(uu => uu.unit_id) || [];

      // Desativar unidades que não estão mais na lista
      const unitsToDeactivate = currentUnitIds.filter(id => !data.unitIds.includes(id));
      if (unitsToDeactivate.length > 0) {
        console.log('Desativando unidades:', unitsToDeactivate);
        const { error: deactivateError } = await supabase
          .from('unit_users')
          .update({ active: false })
          .eq('user_id', userId)
          .in('unit_id', unitsToDeactivate);

        if (deactivateError) {
          console.error('Erro ao desativar unidades:', deactivateError);
          throw deactivateError;
        }
      }

      // Adicionar novas unidades
      const unitsToAdd = data.unitIds.filter(id => !currentUnitIds.includes(id));
      if (unitsToAdd.length > 0) {
        console.log('Adicionando novas unidades:', unitsToAdd);
        const newUnitUsers = unitsToAdd.map(unitId => ({
          user_id: userId,
          unit_id: unitId,
          role: data.role,
          active: true
        }));

        const { error: insertError } = await supabase
          .from('unit_users')
          .insert(newUnitUsers);

        if (insertError) {
          console.error('Erro ao inserir novas unidades:', insertError);
          throw insertError;
        }
      }

      // Atualizar role nas unidades existentes que permaneceram
      const unitsToUpdate = data.unitIds.filter(id => currentUnitIds.includes(id));
      if (unitsToUpdate.length > 0) {
        console.log('Atualizando role nas unidades existentes:', unitsToUpdate);
        const { error: updateError } = await supabase
          .from('unit_users')
          .update({ role: data.role })
          .eq('user_id', userId)
          .in('unit_id', unitsToUpdate);

        if (updateError) {
          console.error('Erro ao atualizar roles:', updateError);
          throw updateError;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('Cache de usuários invalidado');

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
