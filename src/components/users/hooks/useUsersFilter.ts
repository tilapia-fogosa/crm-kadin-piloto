import { useState, useMemo } from 'react';

/** Tipo esperado para cada usuário na tabela */
interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
  role: string;
  unit_name: string;
}

/**
 * Hook de filtros client-side para a lista de usuários.
 * Aplica filtros por nome, email, unidade e função usando useMemo.
 */
export function useUsersFilter(users: User[]) {
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [filterUnit, setFilterUnit] = useState('todas');
  const [filterRole, setFilterRole] = useState('todas');

  /** Extrai lista única de unidades dos dados carregados */
  const uniqueUnits = useMemo(() => {
    const units = new Set<string>();
    users.forEach(u => {
      // unit_name pode conter múltiplas unidades separadas por vírgula
      u.unit_name.split(',').forEach(name => {
        const trimmed = name.trim();
        if (trimmed && trimmed !== 'Unidade Padrão') units.add(trimmed);
      });
    });
    return Array.from(units).sort();
  }, [users]);

  /** Filtra os usuários com base nos critérios selecionados */
  const filteredUsers = useMemo(() => {
    console.log('Aplicando filtros - nome:', searchName, 'email:', searchEmail, 'unidade:', filterUnit, 'função:', filterRole);

    return users.filter(user => {
      // Filtro por nome (case-insensitive, parcial)
      if (searchName && !user.full_name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Filtro por email (case-insensitive, parcial)
      if (searchEmail && !user.email.toLowerCase().includes(searchEmail.toLowerCase())) {
        return false;
      }

      // Filtro por unidade (match exato no unit_name)
      if (filterUnit !== 'todas' && !user.unit_name.includes(filterUnit)) {
        return false;
      }

      // Filtro por função (match exato no role)
      if (filterRole !== 'todas' && user.role !== filterRole) {
        return false;
      }

      return true;
    });
  }, [users, searchName, searchEmail, filterUnit, filterRole]);

  /** Reseta todos os filtros */
  const clearFilters = () => {
    console.log('Limpando todos os filtros');
    setSearchName('');
    setSearchEmail('');
    setFilterUnit('todas');
    setFilterRole('todas');
  };

  const hasActiveFilters = searchName !== '' || searchEmail !== '' || filterUnit !== 'todas' || filterRole !== 'todas';

  return {
    searchName, setSearchName,
    searchEmail, setSearchEmail,
    filterUnit, setFilterUnit,
    filterRole, setFilterRole,
    uniqueUnits,
    filteredUsers,
    clearFilters,
    hasActiveFilters,
  };
}
