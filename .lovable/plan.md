
# Plano: Correção da Exibição de Mídia no WhatsApp CRM

## Problema Identificado
A imagem não aparece na conversa porque:

1. **Campo `tipo_mensagem` está em inglês (`image`) em vez de português (`imagem`)**
   - O componente espera: `'imagem'`, `'audio'`, `'video'`
   - O banco tem: `'image'`

2. **URL do storage está incompleta** (falta `/public/` no path)
   - Salvo: `.../storage/v1/object/wpp_comercial/...`
   - Correto: `.../storage/v1/object/public/wpp_comercial/...`

---

## Solução

Atualizar o componente `ChatMessage.tsx` para:
1. Aceitar tipos de mídia em **inglês E português** (tornando o sistema robusto)
2. **Normalizar URLs** para garantir que tenham `/public/` quando necessário

---

## Alterações Técnicas

### Arquivo: `src/pages/whatsapp/components/ChatMessage.tsx`

**Mudança 1: Normalizar tipo de mensagem**
Criar função helper que converte tipos em inglês para português:

```text
const normalizeMediaType = (type: string | null | undefined): string | null => {
  if (!type) return null;
  
  const typeMap: Record<string, string> = {
    'image': 'imagem',
    'imagem': 'imagem',
    'audio': 'audio',
    'video': 'video',
  };
  
  return typeMap[type.toLowerCase()] || type;
};
```

**Mudança 2: Normalizar URL do storage**
Criar função helper que corrige URLs sem `/public/`:

```text
const normalizeStorageUrl = (url: string): string => {
  // Se a URL já tem /public/, retorna sem alteração
  if (url.includes('/object/public/')) return url;
  
  // Substitui /object/BUCKET por /object/public/BUCKET
  return url.replace('/object/', '/object/public/');
};
```

**Mudança 3: Aplicar normalizações**
Atualizar a lógica de renderização para usar as funções de normalização.

---

## Benefícios

1. **Retrocompatibilidade**: Funciona com dados existentes em inglês ou português
2. **Resiliência**: Corrige URLs malformadas automaticamente
3. **Sem migração de dados**: Não precisa alterar registros existentes no banco
4. **Preparado para o futuro**: Aceita ambos os formatos de entrada

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/whatsapp/components/ChatMessage.tsx` | Adicionar funções de normalização e aplicá-las na renderização |

---

## Resultado Esperado

Após a correção:
- Imagens com `tipo_mensagem = 'image'` serão exibidas corretamente
- URLs sem `/public/` serão corrigidas automaticamente
- O sistema funcionará com ambos os formatos (inglês/português)
