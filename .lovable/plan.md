

## Plano: Adicionar filtros na página de Usuários

### Abordagem
Filtros client-side aplicados sobre os dados já carregados, usando `useMemo` para performance. Os dados já vêm completos do Supabase (nome, email, unidade, função).

### Implementação

**1. Criar hook `useUsersFilter`** (`src/components/users/hooks/useUsersFilter.ts`)
- Estados: `searchName`, `searchEmail`, `filterUnit`, `filterRole`
- `useMemo` que filtra o array de users por:
  - Nome: `includes` case-insensitive
  - Email: `includes` case-insensitive
  - Unidade: match exato no `unit_name` (ou "todas")
  - Função: match exato no `role` (ou "todas")
- Extrair listas únicas de unidades e funções dos dados para popular os selects

**2. Criar componente `UsersFilters`** (`src/components/users/UsersFilters.tsx`)
- Layout horizontal com 4 campos:
  - Input de texto para Nome
  - Input de texto para Email
  - Select para Unidade (opções extraídas dos dados)
  - Select para Função (opções: consultor, franqueado, admin, educador, gestor_pedagogico, financeiro, administrativo, estagiario, sala, sdr)
- Botão "Limpar filtros" para resetar tudo

**3. Atualizar `UsersPage`** (`src/pages/users/index.tsx`)
- Importar e usar o hook `useUsersFilter` com os dados carregados
- Renderizar `UsersFilters` entre o header e a tabela
- Passar `filteredUsers` para `UsersTable` em vez de `users`

