/**
 * Hook para buscar usuários ativos das unidades selecionadas
 * 
 * @description
 * Busca todos os usuários que têm acesso às unidades selecionadas,
 * fazendo join com a tabela profiles para obter o nome completo.
 * Usado para popular o filtro multi-usuário no painel de produtividade.
 * 
 * @param selectedUnitIds - Array de IDs das unidades
 * @param enabled - Se a query deve ser executada
 * @returns Lista de usuários com id e full_name
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseUnitUsersProps {
  selectedUnitIds: string[];
  enabled?: boolean;
}

interface UnitUser {
  id: string;
  full_name: string;
  access_blocked?: boolean; // Para debug opcional
}

export function useUnitUsers({ selectedUnitIds, enabled = true }: UseUnitUsersProps) {
  console.log('👥 [useUnitUsers] Buscando usuários para unidades:', selectedUnitIds);

  return useQuery({
    queryKey: ['unit-users', selectedUnitIds],
    queryFn: async (): Promise<UnitUser[]> => {
      console.log('👥 [useUnitUsers] Executando query para:', selectedUnitIds);

      // Se não há unidades selecionadas, retorna array vazio
      if (!selectedUnitIds || selectedUnitIds.length === 0) {
        console.log('👥 [useUnitUsers] Nenhuma unidade selecionada - retornando array vazio');
        return [];
      }

      console.log('👥 [useUnitUsers] Filtrando: unit_users.active=true AND profiles.access_blocked=false');

      // Buscar usuários das unidades com join em profiles
      // FILTRA usuários bloqueados E inativos na unidade
      const { data, error } = await supabase
        .from('unit_users')
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name,
            access_blocked
          )
        `)
        .in('unit_id', selectedUnitIds)
        .eq('active', true)                        // Filtra unit_users.active
        .eq('profiles.access_blocked', false);     // Filtra profiles.access_blocked

      if (error) {
        console.error('👥 [useUnitUsers] Erro ao buscar usuários:', error);
        throw error;
      }

      console.log('👥 [useUnitUsers] Dados brutos recebidos:', data);

      // Transformar dados e remover duplicatas
      const usersMap = new Map<string, UnitUser>();
      
      data?.forEach(item => {
        const profile = item.profiles as { id: string; full_name: string };
        if (profile && !usersMap.has(profile.id)) {
          usersMap.set(profile.id, {
            id: profile.id,
            full_name: profile.full_name || 'Sem nome',
          });
        }
      });

      const users = Array.from(usersMap.values()).sort((a, b) => 
        a.full_name.localeCompare(b.full_name)
      );

      console.log(`👥 [useUnitUsers] ${users.length} usuários encontrados:`, users);

      return users;
    },
    enabled: enabled && selectedUnitIds.length > 0,
    staleTime: 30000, // 30s
    gcTime: 60000, // 60s
  });
}
