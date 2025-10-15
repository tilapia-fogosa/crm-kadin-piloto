/**
 * Hook para verificar se o usuário pode filtrar por outros usuários
 * 
 * @description
 * Verifica se o usuário atual tem role de 'franqueado' ou 'admin' em pelo menos
 * uma das unidades selecionadas. Usuários com essas roles podem filtrar estatísticas
 * por múltiplos usuários.
 * 
 * @param selectedUnitIds - Array de IDs das unidades selecionadas
 * @returns canFilterByUsers - Boolean indicando se pode filtrar por usuários
 */

import { useUserRole } from "./useUserRole";

interface UseCanFilterByUsersProps {
  selectedUnitIds: string[];
}

export function useCanFilterByUsers({ selectedUnitIds }: UseCanFilterByUsersProps) {
  console.log('🔐 [useCanFilterByUsers] Verificando permissões para unidades:', selectedUnitIds);

  // Se não há unidades selecionadas, não pode filtrar
  if (!selectedUnitIds || selectedUnitIds.length === 0) {
    console.log('🔐 [useCanFilterByUsers] Nenhuma unidade selecionada - sem permissão');
    return { canFilterByUsers: false };
  }

  // Verificar role em cada unidade selecionada
  const rolesCheck = selectedUnitIds.map(unitId => {
    const { role } = useUserRole(unitId);
    const hasPermission = role === 'franqueado' || role === 'admin';
    
    console.log(`🔐 [useCanFilterByUsers] Unidade ${unitId}: role=${role}, permissão=${hasPermission}`);
    
    return hasPermission;
  });

  // Se pelo menos uma unidade tem permissão, pode filtrar
  const canFilterByUsers = rolesCheck.some(hasPermission => hasPermission);

  console.log('🔐 [useCanFilterByUsers] Resultado final - canFilterByUsers:', canFilterByUsers);

  return { canFilterByUsers };
}
