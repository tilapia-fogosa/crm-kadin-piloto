
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { isValidEmail } from "../utils/validation";
import { UserRole } from "../types";

export function useUserOperations(onSuccess: () => void) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole | ''>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateForm = (isAdmin: boolean) => {
    if (!role) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um perfil de acesso.",
      });
      return false;
    }

    if (!isAdmin && role === 'admin') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Apenas administradores podem criar outros administradores.",
      });
      return false;
    }

    if (email && !isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um email válido.",
      });
      return false;
    }

    return true;
  };

  const handleUpdateUser = async (userId: string) => {
    if (!role) return; // Early return if no role selected

    // Verificar se a role já existe para o usuário
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();

    if (!existingRole) {
      // Se a role atual é diferente, primeiro deletamos a antiga
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Depois inserimos a nova
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (roleError) throw roleError;
    }

    // Update user units
    // Primeiro, removemos todas as unidades existentes
    const { error: deleteError } = await supabase
      .from('unit_users')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Depois, adicionamos as novas unidades selecionadas
    if (selectedUnits.length > 0) {
      const unitUserPromises = selectedUnits.map(unitId => 
        supabase
          .from('unit_users')
          .insert({
            user_id: userId,
            unit_id: unitId,
          })
      );

      const results = await Promise.all(unitUserPromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        throw new Error('Erro ao vincular usuário às unidades');
      }
    }
  };

  const handleCreateUser = async () => {
    if (!role) return; // Early return if no role selected

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          email: email,
        }
      }
    });

    if (signUpError || !authData.user) {
      throw signUpError || new Error('Erro ao criar usuário');
    }

    // Primeiro, garantimos que o perfil foi criado
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: authData.user.id,
        full_name: name,
        email: email
      });

    if (profileError) throw profileError;

    // Aguardamos um momento para garantir que o perfil foi criado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Depois criamos a role do usuário
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: role as UserRole
      });

    if (roleError) throw roleError;

    // Por fim, criamos as relações com as unidades
    if (selectedUnits.length > 0) {
      const unitUserPromises = selectedUnits.map(unitId => 
        supabase
          .from('unit_users')
          .insert({
            user_id: authData.user.id,
            unit_id: unitId,
          })
      );

      const results = await Promise.all(unitUserPromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        throw new Error('Erro ao vincular usuário às unidades');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, isAdmin: boolean, editingUser?: { user_id: string } | null) => {
    e.preventDefault();

    if (!validateForm(isAdmin)) {
      return;
    }

    try {
      if (editingUser) {
        await handleUpdateUser(editingUser.user_id);
      } else {
        await handleCreateUser();
      }

      toast({
        title: "Sucesso",
        description: editingUser 
          ? "Usuário atualizado com sucesso."
          : "Usuário criado e vinculado às unidades com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      setEmail("");
      setName("");
      setPassword("");
      setSelectedUnits([]);
      setRole('');
      onSuccess();

    } catch (error) {
      console.error('Erro detalhado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar usuário",
      });
    }
  };

  return {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    selectedUnits,
    setSelectedUnits,
    role,
    setRole,
    handleSubmit
  };
}
