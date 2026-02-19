
# Redesign dos Cards do Kanban - Layout Compacto e Responsivo

## Objetivo
Simplificar os cards para exibir apenas 4 informacoes em coluna unica e tornar as colunas do Kanban responsivas, adaptando-se ao tamanho do monitor.

---

## 1. Informacoes a manter (empilhadas verticalmente)
- Nome do cliente
- Proximo contato (com cores verde/amarelo/vermelho)
- Botoes de Valorizacao
- Icone do WhatsApp

## 2. Informacoes a remover
- Data de cadastro
- Origem do lead
- Nome de registro
- Telefone e icone de telefone
- Labels/Etiquetas
- Badge "Contatos"
- Badge "Agenda"

---

## Mudancas por arquivo

### A) `KanbanCard.tsx`
- Remover imports nao utilizados: `Calendar`, `Phone`, `Badge`, `Tooltip*`
- Remover variaveis: `contactsCount`, `schedulingCount`, `createdAtDate`, `isValidDate`
- Substituir layout por estrutura compacta em coluna unica:

```text
+------------------------+
| Nome do Cliente        |
| Clock 01-01-25 14:00   |
| [Valorizacao buttons]  |
| [WhatsApp icon]        |
+------------------------+
```

- Usar `Card` com padding reduzido (`p-2`), sem `CardHeader` separado
- Nome: `text-sm font-semibold`, com `truncate` para nomes longos
- Proximo contato: linha com icone `Clock` h-3, cores mantidas
- WhatsApp: icone compacto alinhado a esquerda
- Simplificar comparacao do `memo` removendo campos nao exibidos

### B) `KanbanBoard.tsx` - Layout responsivo
- Remover largura fixa `w-[320px]` e `minWidth` hardcoded
- Usar CSS Grid responsivo com `grid-cols-5` e `1fr` para cada coluna
- As 5 colunas dividem igualmente o espaco disponivel na tela
- Em telas menores, manter scroll horizontal com largura minima por coluna (`min-w-[160px]`)
- Estrutura:

```text
Tela grande (1920px): 5 colunas de ~350px cada
Tela media (1366px):  5 colunas de ~250px cada
Tela pequena (1024px): 5 colunas de ~180px cada, com scroll se necessario
```

### C) `ValorizationButtons.tsx`
- Reduzir botoes de `h-8 w-8` para `h-6 w-6`
- Reduzir icones de `h-4 w-4` para `h-3 w-3`
- Manter dialogs inalterados

### D) `InfiniteKanbanColumn.tsx`
- Reduzir padding interno de `p-4` para `p-2`
- Reduzir gap entre cards de `gap-4` para `gap-2`

---

## Detalhes tecnicos da responsividade

A abordagem sera usar CSS Grid no container das colunas em `KanbanBoard.tsx`:

```text
Container das colunas:
- display: grid
- grid-template-columns: repeat(5, minmax(160px, 1fr))
- gap: 8px (gap-2)
- width: 100%
- overflow-x: auto (scroll quando colunas ficam menores que 160px)
```

Isso garante que:
- Em monitores grandes, as colunas expandem para preencher toda a tela
- Em monitores menores, as colunas encolhem ate um minimo de 160px
- Abaixo de ~800px de largura util, aparece scroll horizontal automaticamente
- Nao ha largura fixa -- tudo se adapta ao espaco disponivel
