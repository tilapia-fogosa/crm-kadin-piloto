
# Plano: Suporte a Mídia no WhatsApp CRM

## Objetivo
Permitir visualização de imagens, áudios e vídeos nas conversas do WhatsApp CRM, salvando URLs de mídia no banco de dados e renderizando corretamente no chat.

---

## Visão Geral da Solução

O fluxo completo para suporte a mídia envolve:
1. **Banco de dados**: Adicionar campo para armazenar URL da mídia
2. **Storage**: Criar bucket para armazenar arquivos do WhatsApp comercial
3. **Frontend**: Atualizar componentes para exibir mídia
4. **Backend**: Ajustar edge functions para salvar URL da mídia

---

## Etapas de Implementação

### 1. Migração do Banco de Dados
Adicionar novo campo `media_url` na tabela `historico_comercial`:

- **Campo**: `media_url` (TEXT, nullable)
- **Descrição**: Armazena a URL pública do arquivo de mídia (imagem, áudio, vídeo)
- **Padrão**: Segue o mesmo padrão já existente em `historico_whatsapp_grupos.url_media`

```text
ALTER TABLE historico_comercial
ADD COLUMN media_url TEXT NULL;
```

### 2. Criar Bucket de Storage
Criar bucket `wpp_comercial` para armazenar mídias do WhatsApp comercial:

- **Nome**: `wpp_comercial`
- **Acesso**: Público (para exibição direta no chat)
- **Tipos permitidos**: imagem/*, audio/*, video/*

### 3. Atualizar Tipos TypeScript
Atualizar `whatsapp.types.ts` para incluir campo de mídia:

```text
interface Message {
  id: number;
  clientId: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
  createdByName?: string | null;
  tipoMensagem?: string | null;
  mediaUrl?: string | null;  // NOVO: URL da mídia
}
```

### 4. Atualizar Hook useMessages
Modificar queries para incluir o novo campo `media_url`:

- Adicionar `media_url` no SELECT
- Mapear para `mediaUrl` no objeto Message
- Funciona tanto para clientes cadastrados quanto não cadastrados

### 5. Atualizar Componente ChatMessage
Renderizar mídia baseado no `tipoMensagem` e `mediaUrl`:

**Lógica de renderização**:
```text
┌─────────────────────────────────────────────────────────────┐
│  tipoMensagem = 'imagem' + mediaUrl presente                │
│  → Renderizar <img> com lightbox para visualização          │
├─────────────────────────────────────────────────────────────┤
│  tipoMensagem = 'audio' + mediaUrl presente                 │
│  → Renderizar <audio> player nativo                         │
├─────────────────────────────────────────────────────────────┤
│  tipoMensagem = 'video' + mediaUrl presente                 │
│  → Renderizar <video> player nativo                         │
├─────────────────────────────────────────────────────────────┤
│  tipoMensagem = 'audio' sem mediaUrl                        │
│  → Manter comportamento atual (áudio transcrito)            │
├─────────────────────────────────────────────────────────────┤
│  Outros casos                                               │
│  → Renderizar texto normalmente                             │
└─────────────────────────────────────────────────────────────┘
```

**Componentes de mídia**:
- Imagem: Miniatura clicável que abre em modal
- Áudio: Player HTML5 com controles
- Vídeo: Player HTML5 com controles e poster

### 6. Atualizar Edge Function send-whatsapp-message
Modificar para salvar `media_url` quando receber URL do webhook:

- Receber campo `media_url` no payload de resposta do webhook
- Salvar no `historico_comercial` junto com a mensagem
- Atualizar `tipo_mensagem` adequadamente ('imagem', 'audio', 'video')

---

## Detalhes Técnicos

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/migrations/` | Nova migração para campo `media_url` |
| `supabase/migrations/` | Criar bucket `wpp_comercial` |
| `src/pages/whatsapp/types/whatsapp.types.ts` | Adicionar `mediaUrl` ao tipo Message |
| `src/pages/whatsapp/hooks/useMessages.ts` | Incluir `media_url` na query |
| `src/pages/whatsapp/components/ChatMessage.tsx` | Renderizar mídia |
| `supabase/functions/send-whatsapp-message/index.ts` | Salvar `media_url` |
| `src/integrations/supabase/types.ts` | Atualização automática após migration |

### Componentes de UI para Mídia

**MediaImage** (dentro de ChatMessage):
- Tamanho máximo: 250x200px
- Click para abrir em tamanho real (Dialog)
- Loading skeleton enquanto carrega
- Fallback para erro de carregamento

**MediaAudio** (dentro de ChatMessage):
- Player nativo do navegador
- Controles: play/pause, barra de progresso, volume
- Estilo visual consistente com o chat

**MediaVideo** (dentro de ChatMessage):
- Player nativo do navegador
- Tamanho máximo: 300x200px
- Controles: play/pause, fullscreen
- Poster frame quando disponível

### Fluxo de Recebimento de Mídia

O webhook externo (N8N/Evolution API) deve:
1. Fazer upload da mídia para o Supabase Storage
2. Retornar a `media_url` pública na resposta
3. Salvar no `historico_comercial` com o `tipo_mensagem` correto

---

## Considerações de Segurança

- Bucket público para exibição direta (sem autenticação)
- RLS na tabela `historico_comercial` mantido
- Validação de tipos MIME no storage
- Limite de tamanho de arquivo (10MB sugerido)

---

## Próximos Passos Opcionais

1. **Envio de mídia pelo CRM**: Permitir upload e envio de imagens/vídeos
2. **Preview de links**: Detectar URLs em mensagens e exibir preview
3. **Download de mídia**: Botão para baixar arquivo
4. **Galeria de mídia**: Visualizar todas as mídias da conversa
