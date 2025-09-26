-- Inserir Kit Types padrão para teste (Kit 1-8)
-- LOG: Criando kit types básicos para funcionalidade de dados comerciais

DO $$
DECLARE
  v_unit_id uuid;
  kit_exists boolean;
BEGIN
  -- Buscar primeira unidade ativa
  SELECT id INTO v_unit_id FROM units WHERE active = true LIMIT 1;
  
  IF v_unit_id IS NOT NULL THEN
    RAISE NOTICE 'LOG: Inserindo Kit Types para unidade %', v_unit_id;
    
    -- Verificar e inserir Kit 1
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 1' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 1', 'Kit básico nivel 1', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 2
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 2' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 2', 'Kit básico nivel 2', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 3
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 3' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 3', 'Kit básico nivel 3', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 4
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 4' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 4', 'Kit básico nivel 4', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 5
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 5' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 5', 'Kit básico nivel 5', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 6
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 6' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 6', 'Kit básico nivel 6', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 7
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 7' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 7', 'Kit básico nivel 7', v_unit_id, true);
    END IF;
    
    -- Verificar e inserir Kit 8
    SELECT EXISTS(SELECT 1 FROM kit_types WHERE name = 'Kit 8' AND unit_id = v_unit_id) INTO kit_exists;
    IF NOT kit_exists THEN
      INSERT INTO kit_types (name, description, unit_id, active) VALUES ('Kit 8', 'Kit básico nivel 8', v_unit_id, true);
    END IF;
    
    RAISE NOTICE 'LOG: Kit Types 1-8 verificados/inseridos para unidade %', v_unit_id;
  ELSE
    RAISE NOTICE 'LOG: Nenhuma unidade encontrada para inserir kit types';
  END IF;
END $$;