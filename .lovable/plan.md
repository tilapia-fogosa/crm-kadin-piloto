
# Simplificar Header do Kanban

## O que sera mantido
- Switch "Mostrar apenas pendentes"
- Switch "Som para novos leads" (com botao de teste)
- Botao "Painel de Atividade" (ActivityDashboard)
- Botao "Agenda de Leads" (CalendarDashboard)
- Campo de pesquisa por nome ou telefone

## O que sera removido
- Seletor de unidades (MultiUnitSelector)
- Botao de refresh (RefreshCw)
- Painel de produtividade inteiro (UserProductivityPanel com TC, CE, AG, AT)

## Alteracoes

### 1. `src/components/kanban/BoardHeader.tsx`
- Remover imports: `MultiUnitSelector`, `UserProductivityPanel`, `useUserProductivityStats`, `useCanFilterByUsers`, `useUnitUsers`, `RefreshCw`
- Remover props da interface: `availableUnits`, `selectedUnitIds`, `setSelectedUnitIds`, `isMultiUnit`, `onRefresh`, `onOpenClient`
- Remover hooks internos: `selectedUserIds`, `canFilterByUsers`, `availableUsers`, `stats/isLoadingStats`
- Remover JSX: bloco do seletor de unidades, botao refresh, painel de produtividade
- Simplificar layout: remover grid de 2 colunas, largura fixa de 448px -- usar layout simples de linha unica
- Atualizar memo comparison para refletir props restantes

### 2. Componentes pais que passam props ao BoardHeader
- Remover passagem das props removidas (`availableUnits`, `setSelectedUnitIds`, `isMultiUnit`, `onRefresh`, `onOpenClient`)
- Nota: `selectedUnitIds` ainda pode ser necessario internamente no pai para queries, mas nao sera passado ao header

### 3. Limpeza (se nao usados em outro lugar)
- Avaliar remocao de `UserProductivityPanel.tsx`, `UserProductivityFilter.tsx`, `MultiUserSelector.tsx`
- Avaliar remocao dos hooks `useUserProductivityStats`, `useCanFilterByUsers`, `useUnitUsers`

## Layout resultante
Uma barra horizontal compacta com: switches a esquerda, botoes de atividade/agenda ao centro, e campo de pesquisa a direita -- tudo em uma unica linha.
