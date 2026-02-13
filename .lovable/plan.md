

# Plano: Alterar status para "novo-cadastro" ao atualizar lead duplicado

## Problema
Quando um lead duplicado e detectado e atualizado, o status atual do cliente e preservado. O comportamento desejado e que o status volte para `novo-cadastro`, fazendo o lead reaparecer no inicio do funil.

## Alteracoes

### 1. Formulario manual (`src/pages/clients/new.tsx`)
Na funcao `updateExistingClient`, adicionar `status: 'novo-cadastro'` ao objeto de update (linha ~173).

### 2. Edge Function `create-client-v2`
No bloco de update do cliente duplicado (~linha 313-331), adicionar `status: 'novo-cadastro'` ao objeto `updateData`.

### 3. Edge Function `create-client`
Mesmo ajuste no bloco equivalente de update do cliente duplicado.

## Detalhes tecnicos

Cada alteracao e uma unica linha adicionada ao objeto de update:

```text
// Em cada local de update de duplicado:
updateData.status = 'novo-cadastro'
```

## Escopo
- 3 arquivos alterados (1 pagina React + 2 edge functions)
- 1 linha adicionada em cada arquivo
- 0 migracoes SQL necessarias
- Requer redeploy das 2 edge functions

