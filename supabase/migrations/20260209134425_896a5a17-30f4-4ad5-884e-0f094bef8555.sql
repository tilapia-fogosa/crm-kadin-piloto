
CREATE OR REPLACE FUNCTION public.create_pos_venda_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- LOG: Verificando se a atividade é do tipo Matrícula e está ativa
  IF NEW.tipo_atividade = 'Matrícula' AND NEW.active = true THEN
    RAISE NOTICE 'LOG: Criando atividade pós-venda para client_activity %', NEW.id;
    
    -- Insere registro na tabela atividade_pos_venda com full_name extraído de notes
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
