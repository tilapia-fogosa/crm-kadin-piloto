-- Migration: Adicionar logging extensivo para diagnóstico de get_user_productivity_stats
-- Objetivo: Rastrear exatamente o que acontece quando a função é chamada pelo frontend

CREATE OR REPLACE FUNCTION public.get_user_productivity_stats(
  p_unit_ids uuid[] DEFAULT NULL::uuid[], 
  p_user_ids uuid[] DEFAULT NULL::uuid[], 
  p_days_back integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_current_user_id uuid;
  v_is_global_admin boolean := false;
  v_has_permission boolean := false;
  v_target_user_ids uuid[];
  v_start_date timestamp with time zone;
  v_result jsonb;
  v_activity_count bigint;
BEGIN
  -- LOG 1: Identificar usuário atual
  v_current_user_id := auth.uid();
  RAISE NOTICE '🔍 [DIAGNOSTIC] auth.uid() = %', v_current_user_id;
  RAISE NOTICE '🔍 [DIAGNOSTIC] Parâmetros recebidos - Unidades: %, Usuários: %, Dias: %', 
    p_unit_ids, p_user_ids, p_days_back;

  -- LOG 2: Verificar se é admin global
  SELECT is_admin INTO v_is_global_admin
  FROM profiles
  WHERE id = v_current_user_id;
  
  RAISE NOTICE '🔍 [DIAGNOSTIC] profiles.is_admin = %', v_is_global_admin;
  
  IF v_is_global_admin THEN
    v_has_permission := true;
    RAISE NOTICE '🔍 [DIAGNOSTIC] ✅ ADMIN GLOBAL detectado - permissão total concedida';
  ELSE
    -- Verificar se é franqueado ou admin em alguma unidade
    IF p_unit_ids IS NOT NULL AND array_length(p_unit_ids, 1) > 0 THEN
      SELECT EXISTS(
        SELECT 1 
        FROM unit_users 
        WHERE user_id = v_current_user_id 
          AND unit_id = ANY(p_unit_ids)
          AND role IN ('franqueado', 'admin')
      ) INTO v_has_permission;
    END IF;
    
    RAISE NOTICE '🔍 [DIAGNOSTIC] Tem permissão por role (franqueado/admin): %', v_has_permission;
  END IF;

  -- LOG 3: Determinar usuários alvo
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) = 0 THEN
    IF v_has_permission THEN
      RAISE NOTICE '🔍 [DIAGNOSTIC] Admin/Franqueado SEM filtro específico → incluindo TODOS usuários';
      v_target_user_ids := NULL;
    ELSE
      RAISE NOTICE '🔍 [DIAGNOSTIC] Consultor → restrito aos próprios dados';
      v_target_user_ids := ARRAY[v_current_user_id];
    END IF;
  ELSE
    IF v_has_permission THEN
      RAISE NOTICE '🔍 [DIAGNOSTIC] Usando filtro de usuários específico: %', p_user_ids;
      v_target_user_ids := p_user_ids;
    ELSE
      RAISE NOTICE '🔍 [DIAGNOSTIC] ⚠️ Consultor tentou acessar outros usuários - forçando próprios dados';
      v_target_user_ids := ARRAY[v_current_user_id];
    END IF;
  END IF;

  RAISE NOTICE '🔍 [DIAGNOSTIC] v_target_user_ids final: %', v_target_user_ids;

  -- LOG 4: Calcular data inicial
  v_start_date := date_trunc('day', now() - (p_days_back || ' days')::interval);
  RAISE NOTICE '🔍 [DIAGNOSTIC] Data inicial calculada: %', v_start_date;

  -- LOG 5: Contar atividades ANTES da agregação
  SELECT COUNT(*) INTO v_activity_count
  FROM client_activities
  WHERE active = true
    AND created_at >= v_start_date
    AND (p_unit_ids IS NULL OR unit_id = ANY(p_unit_ids))
    AND (v_target_user_ids IS NULL OR created_by = ANY(v_target_user_ids));
  
  RAISE NOTICE '🔍 [DIAGNOSTIC] Total de atividades encontradas (antes de agregação): %', v_activity_count;

  -- Construir resultado agregado
  WITH activity_counts AS (
    SELECT 
      tipo_atividade,
      DATE_PART('day', now() - created_at) as days_ago,
      COUNT(*) as count
    FROM client_activities
    WHERE active = true
      AND created_at >= v_start_date
      AND (p_unit_ids IS NULL OR unit_id = ANY(p_unit_ids))
      AND (v_target_user_ids IS NULL OR created_by = ANY(v_target_user_ids))
    GROUP BY tipo_atividade, days_ago
  ),
  aggregated_stats AS (
    SELECT
      tipo_atividade,
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 1)::numeric / NULLIF(1, 0), 0)) as day1,
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 3)::numeric / NULLIF(3, 0), 0)) as day3,
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 7)::numeric / NULLIF(7, 0), 0)) as day7,
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 15)::numeric / NULLIF(15, 0), 0)) as day15
    FROM activity_counts
    GROUP BY tipo_atividade
  )
  SELECT jsonb_object_agg(
    CASE tipo_atividade
      WHEN 'Tentativa de Contato' THEN 'tentativaContato'
      WHEN 'Contato Efetivo' THEN 'contatoEfetivo'
      WHEN 'Agendamento' THEN 'agendamento'
      WHEN 'Atendimento' THEN 'atendimento'
    END,
    jsonb_build_object(
      'day1', COALESCE(day1, 0),
      'day3', COALESCE(day3, 0),
      'day7', COALESCE(day7, 0),
      'day15', COALESCE(day15, 0)
    )
  ) INTO v_result
  FROM aggregated_stats;

  -- LOG 6: Resultado ANTES da garantia de estrutura completa
  RAISE NOTICE '🔍 [DIAGNOSTIC] Resultado agregado (antes de garantir estrutura): %', v_result;

  -- Garantir estrutura completa
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

  -- LOG 7: Resultado FINAL
  RAISE NOTICE '🔍 [DIAGNOSTIC] ✅ Resultado FINAL sendo retornado: %', v_result;
  RETURN v_result;
END;
$function$;