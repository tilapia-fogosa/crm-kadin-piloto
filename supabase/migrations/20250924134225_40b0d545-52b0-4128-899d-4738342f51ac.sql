-- LOG: Criando funções backend para gerenciamento de atividades de pós-venda
-- Esta migração centraliza toda lógica de negócio no backend

-- Função para gerenciar configuração de atividades (CRUD completo)
CREATE OR REPLACE FUNCTION public.manage_pos_venda_activity_config(
  p_operation text, -- 'create', 'update', 'delete', 'reorder'
  p_activity_id uuid DEFAULT NULL,
  p_unit_id uuid DEFAULT NULL,
  p_nome text DEFAULT NULL,
  p_descricao text DEFAULT NULL,
  p_ordem integer DEFAULT NULL,
  p_ativa boolean DEFAULT true,
  p_new_order integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid;
  v_max_order integer;
  v_current_order integer;
BEGIN
  -- LOG: Iniciando operação de gerenciamento de atividade
  RAISE NOTICE 'LOG: Operação % iniciada para atividade % na unidade %', p_operation, p_activity_id, p_unit_id;
  
  -- Verificar usuário autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar permissão na unidade (exceto para operações de leitura)
  IF p_operation != 'read' AND NOT EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = p_unit_id 
    AND user_id = v_user_id 
    AND active = true
  ) THEN
    RAISE EXCEPTION 'Usuário não tem permissão nesta unidade';
  END IF;
  
  -- Executar operação específica
  CASE p_operation
    WHEN 'create' THEN
      -- LOG: Criando nova atividade
      RAISE NOTICE 'LOG: Criando atividade % na unidade %', p_nome, p_unit_id;
      
      -- Buscar próxima ordem se não informada
      IF p_ordem IS NULL THEN
        SELECT COALESCE(MAX(ordem), 0) + 1 INTO v_max_order
        FROM pos_venda_atividades_config
        WHERE unit_id = p_unit_id;
        p_ordem := v_max_order;
      END IF;
      
      INSERT INTO pos_venda_atividades_config (
        unit_id, nome, descricao, ordem, ativa, created_by
      ) VALUES (
        p_unit_id, p_nome, p_descricao, p_ordem, p_ativa, v_user_id
      ) RETURNING to_jsonb(pos_venda_atividades_config.*) INTO v_result;
      
    WHEN 'update' THEN
      -- LOG: Atualizando atividade existente
      RAISE NOTICE 'LOG: Atualizando atividade %', p_activity_id;
      
      UPDATE pos_venda_atividades_config
      SET 
        nome = COALESCE(p_nome, nome),
        descricao = COALESCE(p_descricao, descricao),
        ordem = COALESCE(p_ordem, ordem),
        ativa = COALESCE(p_ativa, ativa),
        updated_at = NOW()
      WHERE id = p_activity_id AND unit_id = p_unit_id
      RETURNING to_jsonb(pos_venda_atividades_config.*) INTO v_result;
      
      IF v_result IS NULL THEN
        RAISE EXCEPTION 'Atividade não encontrada ou sem permissão';
      END IF;
      
    WHEN 'delete' THEN
      -- LOG: Removendo atividade (soft delete)
      RAISE NOTICE 'LOG: Desativando atividade %', p_activity_id;
      
      UPDATE pos_venda_atividades_config
      SET ativa = false, updated_at = NOW()
      WHERE id = p_activity_id AND unit_id = p_unit_id
      RETURNING to_jsonb(pos_venda_atividades_config.*) INTO v_result;
      
    WHEN 'reorder' THEN
      -- LOG: Reordenando atividades
      RAISE NOTICE 'LOG: Reordenando atividade % para posição %', p_activity_id, p_new_order;
      
      -- Buscar ordem atual
      SELECT ordem INTO v_current_order
      FROM pos_venda_atividades_config
      WHERE id = p_activity_id AND unit_id = p_unit_id;
      
      IF v_current_order IS NULL THEN
        RAISE EXCEPTION 'Atividade não encontrada';
      END IF;
      
      -- Ajustar ordens dos outros itens
      IF p_new_order > v_current_order THEN
        -- Movendo para baixo: diminui ordem dos itens entre atual e nova posição
        UPDATE pos_venda_atividades_config
        SET ordem = ordem - 1, updated_at = NOW()
        WHERE unit_id = p_unit_id
        AND ordem > v_current_order
        AND ordem <= p_new_order
        AND id != p_activity_id;
      ELSE
        -- Movendo para cima: aumenta ordem dos itens entre nova posição e atual
        UPDATE pos_venda_atividades_config
        SET ordem = ordem + 1, updated_at = NOW()
        WHERE unit_id = p_unit_id
        AND ordem >= p_new_order
        AND ordem < v_current_order
        AND id != p_activity_id;
      END IF;
      
      -- Atualizar ordem do item movido
      UPDATE pos_venda_atividades_config
      SET ordem = p_new_order, updated_at = NOW()
      WHERE id = p_activity_id AND unit_id = p_unit_id
      RETURNING to_jsonb(pos_venda_atividades_config.*) INTO v_result;
      
    ELSE
      RAISE EXCEPTION 'Operação não suportada: %', p_operation;
  END CASE;
  
  RAISE NOTICE 'LOG: Operação % concluída com sucesso', p_operation;
  RETURN v_result;
END;
$$;

-- Função para buscar configurações de atividades com dados do criador
CREATE OR REPLACE FUNCTION public.get_pos_venda_activities_config(
  p_unit_id uuid
)
RETURNS TABLE(
  id uuid,
  nome text,
  descricao text,
  ordem integer,
  ativa boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  created_by_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Buscando configurações de atividades
  RAISE NOTICE 'LOG: Buscando atividades configuradas para unidade %', p_unit_id;
  
  -- Verificar permissão na unidade
  IF NOT EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = p_unit_id 
    AND user_id = auth.uid() 
    AND active = true
  ) THEN
    RAISE EXCEPTION 'Usuário não tem permissão nesta unidade';
  END IF;
  
  RETURN QUERY
  SELECT 
    pac.id,
    pac.nome,
    pac.descricao,
    pac.ordem,
    pac.ativa,
    pac.created_at,
    pac.updated_at,
    pac.created_by,
    COALESCE(p.full_name, 'Usuário removido') as created_by_name
  FROM pos_venda_atividades_config pac
  LEFT JOIN profiles p ON pac.created_by = p.id
  WHERE pac.unit_id = p_unit_id
  ORDER BY pac.ordem ASC, pac.created_at ASC;
  
  RAISE NOTICE 'LOG: Configurações de atividades retornadas com sucesso';
END;
$$;

-- Função para gerenciar status de atividades realizadas
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
  v_user_name text;
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
  
  -- Buscar nome do usuário
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = v_user_id;
  
  v_user_name := COALESCE(v_user_name, 'Usuário não identificado');
  
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
        WHEN p_realizada THEN v_user_name
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
        'usuario_id', v_user_id,
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
      CASE WHEN p_realizada THEN v_user_name ELSE NULL END
    )
    RETURNING 
      jsonb_build_object(
        'id', id,
        'atividade_pos_venda_id', atividade_pos_venda_id,
        'atividade_config_id', atividade_config_id,
        'realizada', realizada,
        'data_realizacao', data_realizacao,
        'usuario_realizou', usuario_realizou,
        'usuario_id', v_user_id,
        'created_at', created_at
      ) INTO v_result;
  END IF;
  
  RAISE NOTICE 'LOG: Status de atividade alterado com sucesso';
  RETURN v_result;
END;
$$;

-- Função para buscar status de atividade específica
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
  -- LOG: Buscando status de atividade específica
  RAISE NOTICE 'LOG: Buscando status da atividade config % para atividade pós-venda %', 
    p_atividade_config_id, p_atividade_pos_venda_id;
  
  SELECT 
    jsonb_build_object(
      'id', par.id,
      'atividade_pos_venda_id', par.atividade_pos_venda_id,
      'atividade_config_id', par.atividade_config_id,
      'realizada', par.realizada,
      'data_realizacao', par.data_realizacao,
      'usuario_realizou', par.usuario_realizou,
      'created_at', par.created_at,
      'updated_at', par.updated_at
    ) INTO v_result
  FROM pos_venda_atividades_realizadas par
  WHERE par.atividade_pos_venda_id = p_atividade_pos_venda_id
  AND par.atividade_config_id = p_atividade_config_id;
  
  IF v_result IS NULL THEN
    RAISE NOTICE 'LOG: Nenhum registro encontrado - atividade não realizada';
    RETURN NULL;
  END IF;
  
  RAISE NOTICE 'LOG: Status de atividade encontrado com sucesso';
  RETURN v_result;
END;
$$;