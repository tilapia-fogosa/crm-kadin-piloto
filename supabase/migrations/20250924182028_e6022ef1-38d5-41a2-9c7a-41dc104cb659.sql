-- LOG: Implementando plano completo de correções

-- ETAPA 1: Corrigir foreign keys e constraints
-- Adicionando FK pos_venda_atividades_config.unit_id → units.id
ALTER TABLE pos_venda_atividades_config 
ADD CONSTRAINT fk_pos_venda_config_unit 
FOREIGN KEY (unit_id) REFERENCES units(id);

-- Adicionando FK pos_venda_atividades_realizadas.atividade_config_id → pos_venda_atividades_config.id
ALTER TABLE pos_venda_atividades_realizadas 
ADD CONSTRAINT fk_pos_venda_realizadas_config 
FOREIGN KEY (atividade_config_id) REFERENCES pos_venda_atividades_config(id);

-- Alterando usuario_realizou para ser FK para profiles.id
ALTER TABLE pos_venda_atividades_realizadas 
DROP COLUMN IF EXISTS usuario_realizou,
ADD COLUMN usuario_realizou uuid REFERENCES profiles(id);

-- ETAPA 2: Corrigir função get_pos_venda_activities para buscar vendedor da atividade "Matrícula"
CREATE OR REPLACE FUNCTION get_pos_venda_activities(p_unit_ids uuid[])
RETURNS TABLE(
  id uuid,
  client_id uuid,
  client_activity_id uuid,
  client_name text,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  active boolean,
  unit_id uuid,
  full_name text,
  cpf text,
  rg text,
  birth_date date,
  address_postal_code text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  photo_url text,
  photo_thumbnail_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Buscando atividades pós-venda com vendedor real da atividade "Matrícula"
  RAISE NOTICE 'LOG: Buscando atividades pós-venda para unidades %', p_unit_ids;
  
  RETURN QUERY
  SELECT 
    apv.id,
    apv.client_id,
    apv.client_activity_id,
    apv.client_name,
    apv.created_by,
    -- Buscar nome real do vendedor que criou a atividade "Matrícula"
    COALESCE(
      (SELECT p_matricula.full_name 
       FROM client_activities ca_matricula
       JOIN profiles p_matricula ON ca_matricula.created_by = p_matricula.id 
       WHERE ca_matricula.id = apv.client_activity_id 
       AND ca_matricula.tipo_atividade = 'Matrícula'
       LIMIT 1),
      -- Fallback para buscar do perfil do usuário que criou a atividade pós-venda
      (SELECT p_activity.full_name 
       FROM profiles p_activity 
       WHERE p_activity.id = apv.created_by),
      -- Último fallback
      'Vendedor não identificado'
    ) as created_by_name,
    apv.created_at,
    apv.updated_at,
    apv.active,
    -- Buscar unit_id do cliente
    c.unit_id,
    apv.full_name,
    apv.cpf,
    apv.rg,
    apv.birth_date,
    apv.address_postal_code,
    apv.address_street,
    apv.address_number,
    apv.address_complement,
    apv.address_neighborhood,
    apv.address_city,
    apv.address_state,
    apv.photo_url,
    apv.photo_thumbnail_url
  FROM atividade_pos_venda apv
  JOIN clients c ON apv.client_id = c.id
  WHERE c.unit_id = ANY(p_unit_ids)
    AND apv.active = true
    AND c.active = true
  ORDER BY apv.created_at DESC;
  
  RAISE NOTICE 'LOG: Atividades pós-venda retornadas com sucesso';
END;
$$;

-- ETAPA 3: Corrigir função toggle_pos_venda_activity_status para usar UUID
CREATE OR REPLACE FUNCTION toggle_pos_venda_activity_status(
  p_atividade_pos_venda_id uuid, 
  p_atividade_config_id uuid, 
  p_realizada boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid;
  v_existing_record record;
BEGIN
  -- LOG: Iniciando toggle de status de atividade
  RAISE NOTICE 'LOG: Alterando status da atividade config % para atividade pós-venda % - realizada: %', 
    p_atividade_config_id, p_atividade_pos_venda_id, p_realizada;
  
  -- Verificar usuário autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se já existe registro
  SELECT * INTO v_existing_record
  FROM pos_venda_atividades_realizadas
  WHERE atividade_pos_venda_id = p_atividade_pos_venda_id
  AND atividade_config_id = p_atividade_config_id;
  
  IF v_existing_record IS NOT NULL THEN
    -- LOG: Atualizando registro existente
    RAISE NOTICE 'LOG: Atualizando registro existente de atividade realizada';
    
    UPDATE pos_venda_atividades_realizadas
    SET 
      realizada = p_realizada,
      data_realizacao = CASE 
        WHEN p_realizada THEN NOW()
        ELSE NULL
      END,
      usuario_realizou = CASE 
        WHEN p_realizada THEN v_user_id
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE atividade_pos_venda_id = p_atividade_pos_venda_id
    AND atividade_config_id = p_atividade_config_id
    RETURNING 
      jsonb_build_object(
        'id', id,
        'atividade_pos_venda_id', atividade_pos_venda_id,
        'atividade_config_id', atividade_config_id,
        'realizada', realizada,
        'data_realizacao', data_realizacao,
        'usuario_realizou', usuario_realizou,
        'usuario_nome', (SELECT full_name FROM profiles WHERE id = usuario_realizou),
        'updated_at', updated_at
      ) INTO v_result;
  ELSE
    -- LOG: Criando novo registro
    RAISE NOTICE 'LOG: Criando novo registro de atividade realizada';
    
    INSERT INTO pos_venda_atividades_realizadas (
      atividade_pos_venda_id,
      atividade_config_id,
      realizada,
      data_realizacao,
      usuario_realizou
    ) VALUES (
      p_atividade_pos_venda_id,
      p_atividade_config_id,
      p_realizada,
      CASE WHEN p_realizada THEN NOW() ELSE NULL END,
      CASE WHEN p_realizada THEN v_user_id ELSE NULL END
    )
    RETURNING 
      jsonb_build_object(
        'id', id,
        'atividade_pos_venda_id', atividade_pos_venda_id,
        'atividade_config_id', atividade_config_id,
        'realizada', realizada,
        'data_realizacao', data_realizacao,
        'usuario_realizou', usuario_realizou,
        'usuario_nome', (SELECT full_name FROM profiles WHERE id = usuario_realizou),
        'created_at', created_at
      ) INTO v_result;
  END IF;
  
  RAISE NOTICE 'LOG: Status de atividade alterado com sucesso';
  RETURN v_result;
END;
$$;

-- ETAPA 4: Implementar trigger automático para criação de atividade_pos_venda
CREATE OR REPLACE FUNCTION create_pos_venda_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Verificando se é atividade de Matrícula
  IF NEW.tipo_atividade = 'Matrícula' AND NEW.active = true THEN
    RAISE NOTICE 'LOG: Criando atividade pós-venda para client_activity %', NEW.id;
    
    -- Inserir nova atividade pós-venda
    INSERT INTO atividade_pos_venda (
      client_id,
      client_activity_id,
      client_name,
      created_by
    ) VALUES (
      NEW.client_id,
      NEW.id,
      (SELECT name FROM clients WHERE id = NEW.client_id),
      NEW.created_by
    );
    
    RAISE NOTICE 'LOG: Atividade pós-venda criada com sucesso';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela client_activities
DROP TRIGGER IF EXISTS trigger_create_pos_venda_activity ON client_activities;
CREATE TRIGGER trigger_create_pos_venda_activity
  AFTER INSERT ON client_activities
  FOR EACH ROW
  EXECUTE FUNCTION create_pos_venda_activity();