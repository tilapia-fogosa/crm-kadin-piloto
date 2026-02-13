

# Plano: Corrigir trigger de criacao de atividade pos-venda

## Problema
O trigger `create_pos_venda_activity` que cria automaticamente um registro na tabela `atividade_pos_venda` quando uma matricula e registrada **nao inclui o campo `unit_id`** no INSERT. Como a coluna `unit_id` e NOT NULL, o INSERT falha com o erro:

```
null value in column "unit_id" of relation "atividade_pos_venda" violates not-null constraint
```

## Causa Raiz
Na ultima atualizacao do trigger (migracao `20260209134425`), o campo `unit_id` foi omitido. O `unit_id` esta disponivel em `NEW.unit_id` (vindo de `client_activities`), mas nao esta sendo passado.

## Correcao
Uma unica migracao SQL para atualizar o trigger, adicionando `unit_id` ao INSERT:

```text
INSERT INTO atividade_pos_venda (
  client_id,
  client_activity_id,
  client_name,
  full_name,
  created_by,
  unit_id          -- campo adicionado
) VALUES (
  NEW.client_id,
  NEW.id,
  (SELECT name FROM clients WHERE id = NEW.client_id),
  NEW.notes,
  NEW.created_by,
  NEW.unit_id      -- valor vindo de client_activities
);
```

## Escopo
- 1 migracao SQL (CREATE OR REPLACE FUNCTION)
- 0 arquivos de codigo alterados
- Correcao imediata: apos aplicar, novas matriculas criarao o registro pos-venda corretamente

