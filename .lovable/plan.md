

# Plano: Corrigir bloqueio de leads duplicados na API

## Problema
Quando um lead duplicado chega pela API `create-client`, o sistema apenas incrementa o contador e retorna, sem atualizar os dados novos do lead (anuncio, email, observacoes, etc.). Isso trava o fluxo de disparo de leads para dentro do sistema.

## Solucao
Modificar a edge function `create-client` para que, ao detectar um duplicado, alem de incrementar o contador, **atualize os dados do cliente existente** com as informacoes novas recebidas no payload.

## Alteracao

### Arquivo: `supabase/functions/create-client/index.ts`

Na secao onde o duplicado e detectado (linhas ~163-190), adicionar um UPDATE nos campos relevantes do cliente existente:

**Campos a atualizar (somente se o valor novo nao for vazio/null):**
- `email` - novo email se fornecido
- `original_ad` - novo anuncio de origem
- `original_adset` - novo adset de origem
- `meta_id` - novo ID do Meta
- `observations` - concatenar novas observacoes (nao sobrescrever)
- `age_range` - faixa etaria atualizada
- `lead_source` - nova fonte do lead (normalizada)

**Status:** Manter o status atual do cliente (nao alterar).

### Logica de atualizacao

```text
1. Detecta duplicado (ja existe)
2. Monta objeto de update somente com campos que vieram preenchidos no payload
3. Concatena observations (antigo + " | " + novo) em vez de sobrescrever
4. Executa UPDATE no cliente existente
5. Incrementa quantidade_cadastros e historico_cadastros (ja existe)
6. Retorna sucesso com duplicate: true e os dados atualizados
```

### Exemplo do codigo modificado (trecho principal)

Na secao do `if (existingClient)`, antes do `updateDuplicateRegistration`, adicionar:

```text
- Montar updateData com campos nao-vazios do payload
- Se payload.observations existe, concatenar com o existente
- Normalizar lead_source antes de atualizar
- Executar supabase.from('clients').update(updateData).eq('id', existingClient.id)
- Manter o status atual (nao incluir status no update)
```

## Resumo
- 1 arquivo alterado: `supabase/functions/create-client/index.ts`
- 0 migracoes SQL necessarias
- O fluxo de disparo de leads continuara funcionando normalmente
- Leads duplicados terao seus dados atualizados sem perder o historico do funil
