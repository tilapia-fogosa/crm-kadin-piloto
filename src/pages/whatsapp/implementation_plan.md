
# Plano de Implementação: Desktop-First WhatsApp Layout

Este plano detalha as mudanças necessárias para transformar a página do WhatsApp em uma experiência Desktop-First otimizada, com layout responsivo fixo, cabeçalho compacto e visualização de status aprimorada.

## 1. Mapeamento de Status e Cores
Criaremos um utilitário centralizado para gerenciar os status, siglas e cores solicitados.

**Arquivo:** `src/pages/whatsapp/utils/statusConfig.ts`

| Status (DB) | Sigla | Cor Sugerida | Significado |
|:--- |:--- |:--- |:--- |
| `novo_cadastro` | **NC** | `bg-blue-500` | Novo Cadastro |
| `tentativa_contato_1` (et all) | **TC** | `bg-yellow-500` | Tentativa de Contato |
| `contato_efetivo` | **CE** | `bg-green-500` | Contato Efetivo |
| `agendamento` | **AG** | `bg-purple-500` | Agendamento |
| `negociacao` | **NG** | `bg-orange-500` | Negociação |
| `matriculado` | **MT** | `bg-emerald-600` | Matriculado |
| `outro` | **--** | `bg-gray-400` | Padrão/Desconhecido |

## 2. Refatoração da Lista de Conversas (ConversationItem)
Substituir o Avatar/Foto do usuário por um indicador visual de etapa (Círculo com Sigla).

**Arquivo:** `src/pages/whatsapp/components/ConversationItem.tsx`
- Remover componente `Avatar`.
- Implementar círculo de status usando `statusConfig`.
- Exibir Sigla (NC, TC, etc) dentro do círculo.
- Otimizar tipografia para desktop (fontes levemente menores, maior densidade).

## 3. Ajuste de Layout Principal (Desktop First)
Fixar larguras e garantir que o chat ocupe o espaço restante.

**Arquivo:** `src/pages/whatsapp/components/ConversationsTab.tsx`
- Aumentar largura da Sidebar: `350px` -> `420px` (para acomodar melhor "lista de mensagens" mais larga).
- Sidebar com largura fixa (não responsiva mobile).
- ChatArea com `flex-1` (ocupa todo o resto).

## 4. Cabeçalho Compacto
Otimizar o cabeçalho da página para ganhar espaço vertical.

**Arquivo:** `src/pages/whatsapp/index.tsx`
- Reduzir padding vertical.
- Reduzir tamanho do título.
- Alinhar Tabs na mesma linha do título (se possível) ou reduzir altura das Tabs.

## 5. Estilo Compacto (WhatsApp Web Style)
Ajustes finos de CSS para densidade de informação.

- Reduzir `padding` dos itens da lista (`p-3` -> `p-2`).
- Ajustar tamanho da fonte da última mensagem (preview).

---
**Ordem de Execução:**
1. Criar `statusConfig.ts`.
2. Atualizar `ConversationItem.tsx` (Visual + Status).
3. Atualizar `ConversationsTab.tsx` (Layout 420px).
4. Atualizar `index.tsx` (Header Compacto).
5. Revisão Visual.
