-- LOG: Iniciando correção das funções de pós-venda para resolver duplicate key e exibição de nomes

-- 1. CORRIGIR: toggle_pos_venda_activity_status com lógica UPSERT
CREATE OR REPLACE FUNCTION public.toggle_pos_venda_activity_status(
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
BEGIN
  -- LOG: Iniciando toggle de status de atividade com UPSERT
  RAISE NOTICE 'LOG: Toggle UPSERT - atividade pós-venda: %, config: %, realizada: %', 
    p_atividade_pos_venda_id, p_atividade_config_id, p_realizada;
  
  -- Verificar usuário autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- UPSERT: INSERT ... ON CONFLICT DO UPDATE
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
  ON CONFLICT (atividade_pos_venda_id, atividade_config_id)
  DO UPDATE SET
    realizada = EXCLUDED.realizada,
    data_realizacao = CASE 
      WHEN EXCLUDED.realizada THEN NOW()
      ELSE NULL
    END,
    usuario_realizou = CASE 
      WHEN EXCLUDED.realizada THEN v_user_id
      ELSE NULL
    END,
    updated_at = NOW()
  RETURNING 
    jsonb_build_object(
      'id', id,
      'atividade_pos_venda_id', atividade_pos_venda_id,
      'atividade_config_id', atividade_config_id,
      'realizada', realizada,
      'data_realizacao', data_realizacao,
      'usuario_realizou', usuario_realizou,
      'usuario_nome', (SELECT full_name FROM profiles WHERE id = usuario_realizou),
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO v_result;
  
  RAISE NOTICE 'LOG: UPSERT concluído com sucesso';
  RETURN v_result;
END;
$$;

-- 2. CORRIGIR: get_pos_venda_activity_status para retornar nome do usuário
CREATE OR REPLACE FUNCTION public.get_pos_venda_activity_status(
  p_atividade_pos_venda_id uuid, 
  p_atividade_config_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- LOG: Buscando status com nome do usuário
  RAISE NOTICE 'LOG: Buscando status com JOIN em profiles - pós-venda: %, config: %', 
    p_atividade_pos_venda_id, p_atividade_config_id;
  
  SELECT 
    jsonb_build_object(
      'id', par.id,
      'atividade_pos_venda_id', par.atividade_pos_venda_id,
      'atividade_config_id', par.atividade_config_id,
      'realizada', par.realizada,
      'data_realizacao', par.data_realizacao,
      'usuario_realizou', par.usuario_realizou,
      'usuario_nome', COALESCE(p.full_name, 'Usuário removido'),
      'created_at', par.created_at,
      'updated_at', par.updated_at
    ) INTO v_result
  FROM pos_venda_atividades_realizadas par
  LEFT JOIN profiles p ON par.usuario_realizou = p.id
  WHERE par.atividade_pos_venda_id = p_atividade_pos_venda_id
  AND par.atividade_config_id = p_atividade_config_id;
  
  IF v_result IS NULL THEN
    RAISE NOTICE 'LOG: Nenhum registro encontrado';
    RETURN NULL;
  END IF;
  
  RAISE NOTICE 'LOG: Status encontrado com nome do usuário';
  RETURN v_result;
END;
$$;

-- 3. CORRIGIR: get_pos_venda_activities para buscar nome real do vendedor da matrícula
CREATE OR REPLACE FUNCTION public.get_pos_venda_activities(p_unit_ids uuid[])
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
  -- LOG: Buscando atividades pós-venda com nome real do vendedor
  RAISE NOTICE 'LOG: Buscando atividades pós-venda com vendedor real para unidades %', p_unit_ids;
  
  RETURN QUERY
  SELECT 
    apv.id,
    apv.client_id,
    apv.client_activity_id,
    apv.client_name,
    apv.created_by,
    -- Buscar nome real do vendedor que criou a atividade "Matrícula"
    COALESCE(
      (SELECT p_vendedor.full_name 
       FROM client_activities ca_matricula
       LEFT JOIN profiles p_vendedor ON ca_matricula.created_by = p_vendedor.id 
       WHERE ca_matricula.id = apv.client_activity_id 
       AND ca_matricula.tipo_atividade = 'Matrícula'
       LIMIT 1),
      'Vendedor não identificado'
    ) as created_by_name,
    apv.created_at,
    apv.updated_at,
    apv.active,
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
  
  RAISE NOTICE 'LOG: Atividades pós-venda retornadas com vendedor real';
END;
$$;