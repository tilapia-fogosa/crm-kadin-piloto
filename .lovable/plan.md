
# Plano: Preencher `full_name` na trigger de pos-venda

## Objetivo
Modificar a trigger function `create_pos_venda_activity` para popular o campo `full_name` da tabela `atividade_pos_venda` automaticamente, usando o nome do aluno que ja e salvo no campo `notes` da atividade de Matricula.

## Contexto
- Quando o consultor registra uma matricula, o nome completo do aluno e salvo em `client_activities.notes`
- A trigger `create_pos_venda_activity` dispara no INSERT de `client_activities` quando `tipo_atividade = 'Matricula'`
- A coluna `full_name` ja existe em `atividade_pos_venda` mas nao e preenchida pela trigger atual

## Alteracao

### Migracaoo SQL
Recriar a function `create_pos_venda_activity` adicionando `NEW.notes` como valor de `full_name`:

```sql
CREATE OR REPLACE FUNCTION create_pos_venda_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_atividade = 'Matrícula' AND NEW.active = true THEN
    RAISE NOTICE 'LOG: Criando atividade pós-venda para client_activity %', NEW.id;
    
    INSERT INTO atividade_pos_venda (
      client_id,
      client_activity_id,
      client_name,
      full_name,
      created_by
    ) VALUES (
      NEW.client_id,
      NEW.id,
      (SELECT name FROM clients WHERE id = NEW.client_id),
      NEW.notes,
      NEW.created_by
    );
    
    RAISE NOTICE 'LOG: Atividade pós-venda criada com sucesso com full_name: %', NEW.notes;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Resumo
- 1 migracao SQL (recriar function)
- 0 arquivos de codigo alterados
- O campo `full_name` sera preenchido automaticamente nas proximas matriculas
