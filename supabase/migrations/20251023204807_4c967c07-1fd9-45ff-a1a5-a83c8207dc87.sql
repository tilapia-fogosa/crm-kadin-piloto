-- Migration: Corrigir JOIN com unit_users em get_user_productivity_stats
-- Problema: Tabela profiles não possui coluna unit_id, causando erro 42703
-- Solução: Usar JOIN com unit_users para buscar usuários de unidades específicas

CREATE OR REPLACE FUNCTION get_user_productivity_stats(
  p_unit_ids UUID[] DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL,
  p_days_back INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_user_ids UUID[];
  v_start_date DATE;
  v_result JSONB;
  v_current_user_id UUID;
  v_is_admin BOOLEAN;
  v_activity_count INT;
BEGIN
  -- LOG 1: Identificar usuário atual
  v_current_user_id := auth.uid();
  RAISE NOTICE '🔍 [DIAGNOSTIC] auth.uid() = %', v_current_user_id;
  RAISE NOTICE '🔍 [DIAGNOSTIC] Parâmetros recebidos - Unidades: %, Usuários: %, Dias: %', p_unit_ids, p_user_ids, p_days_back;

  -- LOG 2: Verificar permissões do usuário
  SELECT COALESCE(is_admin, false)
  INTO v_is_admin
  FROM profiles
  WHERE id = v_current_user_id;

  RAISE NOTICE '🔍 [DIAGNOSTIC] profiles.is_admin = %', v_is_admin;

  -- LOG 3: Lógica de permissões
  IF v_is_admin THEN
    -- Usuário é admin global: pode ver qualquer usuário
    RAISE NOTICE '🔍 [DIAGNOSTIC] ✅ ADMIN GLOBAL detectado - permissão total concedida';
    
    IF p_user_ids IS NOT NULL AND array_length(p_user_ids, 1) > 0 THEN
      v_target_user_ids := p_user_ids;
      RAISE NOTICE '🔍 [DIAGNOSTIC] Usando filtro de usuários específico: %', v_target_user_ids;
    ELSE
      -- Admin sem filtro de usuários: buscar todos da(s) unidade(s)
      IF p_unit_ids IS NOT NULL AND array_length(p_unit_ids, 1) > 0 THEN
        -- CORREÇÃO: Usar unit_users ao invés de profiles
        SELECT ARRAY_AGG(DISTINCT uu.user_id)
        INTO v_target_user_ids
        FROM unit_users uu
        WHERE uu.unit_id = ANY(p_unit_ids)
          AND uu.active = true;
        RAISE NOTICE '🔍 [DIAGNOSTIC] Admin sem filtro de usuários - buscando todos das unidades: %', v_target_user_ids;
      ELSE
        -- Admin sem nenhum filtro: todos os usuários do sistema
        SELECT ARRAY_AGG(DISTINCT id)
        INTO v_target_user_ids
        FROM profiles;
        RAISE NOTICE '🔍 [DIAGNOSTIC] Admin sem filtros - buscando TODOS usuários do sistema: %', v_target_user_ids;
      END IF;
    END IF;
  ELSE
    -- Usuário NÃO é admin global: verificar role na tabela unit_users
    IF EXISTS (
      SELECT 1 
      FROM unit_users 
      WHERE user_id = v_current_user_id 
        AND role IN ('franqueado', 'admin')
        AND (p_unit_ids IS NULL OR unit_id = ANY(p_unit_ids))
    ) THEN
      -- Usuário é franqueado/admin de unidade: pode ver usuários da(s) unidade(s)
      RAISE NOTICE '🔍 [DIAGNOSTIC] ✅ FRANQUEADO/ADMIN de unidade detectado';
      
      IF p_user_ids IS NOT NULL AND array_length(p_user_ids, 1) > 0 THEN
        v_target_user_ids := p_user_ids;
        RAISE NOTICE '🔍 [DIAGNOSTIC] Usando filtro de usuários específico: %', v_target_user_ids;
      ELSE
        -- CORREÇÃO: Usar unit_users ao invés de profiles
        SELECT ARRAY_AGG(DISTINCT uu.user_id)
        INTO v_target_user_ids
        FROM unit_users uu
        WHERE uu.unit_id = ANY(p_unit_ids)
          AND uu.active = true;
        RAISE NOTICE '🔍 [DIAGNOSTIC] Franqueado sem filtro de usuários - buscando todos das unidades: %', v_target_user_ids;
      END IF;
    ELSE
      -- Usuário é consultor: só pode ver seus próprios dados
      v_target_user_ids := ARRAY[v_current_user_id];
      RAISE NOTICE '🔍 [DIAGNOSTIC] ⚠️ CONSULTOR detectado - forçando filtro para usuário atual apenas: %', v_target_user_ids;
    END IF;
  END IF;

  RAISE NOTICE '🔍 [DIAGNOSTIC] v_target_user_ids final: %', v_target_user_ids;

  -- Calcular data de início
  v_start_date := CURRENT_DATE - p_days_back;

  -- CTE para contar atividades por tipo e período
  WITH activity_counts AS (
    SELECT 
      tipo_atividade,
      CASE
        WHEN DATE(created_at) >= CURRENT_DATE - 1 THEN 'day1'
        WHEN DATE(created_at) >= CURRENT_DATE - 3 THEN 'day3'
        WHEN DATE(created_at) >= CURRENT_DATE - 7 THEN 'day7'
        ELSE 'day15'
      END AS period,
      COUNT(*) AS count
    FROM client_activities
    WHERE created_at >= v_start_date
      AND active = true
      AND (p_unit_ids IS NULL OR client_activities.unit_id = ANY(p_unit_ids))
      AND (v_target_user_ids IS NULL OR created_by = ANY(v_target_user_ids))
    GROUP BY tipo_atividade, period
  ),
  aggregated_stats AS (
    SELECT 
      CASE tipo_atividade
        WHEN 'Tentativa de Contato' THEN 'tentativaContato'
        WHEN 'Contato Efetivo' THEN 'contatoEfetivo'
        WHEN 'Agendamento' THEN 'agendamento'
        WHEN 'Atendimento' THEN 'atendimento'
      END AS activity_key,
      jsonb_build_object(
        'day1', COALESCE(SUM(CASE WHEN period = 'day1' THEN count ELSE 0 END), 0),
        'day3', COALESCE(SUM(CASE WHEN period = 'day3' THEN count ELSE 0 END), 0),
        'day7', COALESCE(SUM(CASE WHEN period = 'day7' THEN count ELSE 0 END), 0),
        'day15', COALESCE(SUM(CASE WHEN period = 'day15' THEN count ELSE 0 END), 0)
      ) AS stats
    FROM activity_counts
    WHERE tipo_atividade IN (
      'Tentativa de Contato',
      'Contato Efetivo',
      'Agendamento',
      'Atendimento'
    )
    GROUP BY tipo_atividade
  )
  SELECT jsonb_object_agg(activity_key, stats)
  INTO v_result
  FROM aggregated_stats;

  -- LOG 4: Contar total de atividades encontradas
  SELECT COUNT(*)
  INTO v_activity_count
  FROM client_activities
  WHERE created_at >= v_start_date
    AND active = true
    AND (p_unit_ids IS NULL OR client_activities.unit_id = ANY(p_unit_ids))
    AND (v_target_user_ids IS NULL OR created_by = ANY(v_target_user_ids));

  RAISE NOTICE '🔍 [DIAGNOSTIC] Total de atividades encontradas: %', v_activity_count;
  RAISE NOTICE '🔍 [DIAGNOSTIC] Resultado agregado: %', v_result;

  -- Garantir que todas as chaves existam, mesmo com valores zero
  IF v_result IS NULL THEN
    v_result := '{}'::jsonb;
  END IF;

  IF NOT v_result ? 'tentativaContato' THEN
    v_result := v_result || jsonb_build_object('tentativaContato', jsonb_build_object('day1', 0, 'day3', 0, 'day7', 0, 'day15', 0));
  END IF;

  IF NOT v_result ? 'contatoEfetivo' THEN
    v_result := v_result || jsonb_build_object('contatoEfetivo', jsonb_build_object('day1', 0, 'day3', 0, 'day7', 0, 'day15', 0));
  END IF;

  IF NOT v_result ? 'agendamento' THEN
    v_result := v_result || jsonb_build_object('agendamento', jsonb_build_object('day1', 0, 'day3', 0, 'day7', 0, 'day15', 0));
  END IF;

  IF NOT v_result ? 'atendimento' THEN
    v_result := v_result || jsonb_build_object('atendimento', jsonb_build_object('day1', 0, 'day3', 0, 'day7', 0, 'day15', 0));
  END IF;

  -- LOG 5: Resultado final
  RAISE NOTICE '🔍 [DIAGNOSTIC] ✅ Resultado FINAL sendo retornado: %', v_result;

  RETURN v_result;
END;
$$;