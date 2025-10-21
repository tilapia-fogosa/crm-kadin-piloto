-- Corrigir permissões de admins globais na função get_user_productivity_stats
-- Fix: Admins globais (profiles.is_admin = true) devem sempre ter acesso total
-- Fix: Remover restrição active = true para verificação de permissão
-- Fix: Garantir JSONB completo com todos os 4 tipos de atividade

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
BEGIN
  -- LOG: Obter usuário atual
  v_current_user_id := auth.uid();
  RAISE NOTICE 'LOG: [get_user_productivity_stats] Usuário atual: %', v_current_user_id;
  RAISE NOTICE 'LOG: [get_user_productivity_stats] Unidades: %, Usuários: %, Dias: %', 
    p_unit_ids, p_user_ids, p_days_back;

  -- LOG: PRIORIDADE 1 - Verificar se é admin global (profiles.is_admin = true)
  SELECT is_admin INTO v_is_global_admin
  FROM profiles
  WHERE id = v_current_user_id;
  
  RAISE NOTICE 'LOG: [get_user_productivity_stats] É admin global: %', v_is_global_admin;
  
  IF v_is_global_admin THEN
    -- Admin global tem permissão total
    v_has_permission := true;
    RAISE NOTICE 'LOG: [get_user_productivity_stats] Admin global detectado - permissão total concedida';
  ELSE
    -- LOG: PRIORIDADE 2 - Verificar se é franqueado ou admin em alguma unidade
    -- IMPORTANTE: Removida restrição active = true (active só indica relação ativa, não permissão)
    IF p_unit_ids IS NOT NULL AND array_length(p_unit_ids, 1) > 0 THEN
      SELECT EXISTS(
        SELECT 1 
        FROM unit_users 
        WHERE user_id = v_current_user_id 
          AND unit_id = ANY(p_unit_ids)
          AND role IN ('franqueado', 'admin')
      ) INTO v_has_permission;
    END IF;
    
    RAISE NOTICE 'LOG: [get_user_productivity_stats] Tem permissão por role: %', v_has_permission;
  END IF;

  -- LOG: REGRA DE NEGÓCIO - Determinar quais usuários incluir
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) = 0 THEN
    IF v_has_permission THEN
      -- Admin global ou Franqueado/Admin sem filtro específico → TODOS os usuários
      RAISE NOTICE 'LOG: [get_user_productivity_stats] Admin/Franqueado - incluindo TODOS usuários';
      v_target_user_ids := NULL; -- NULL = todos
    ELSE
      -- Consultor → APENAS seus próprios dados
      RAISE NOTICE 'LOG: [get_user_productivity_stats] Consultor - apenas dados próprios';
      v_target_user_ids := ARRAY[v_current_user_id];
    END IF;
  ELSE
    -- Usuários específicos foram solicitados
    IF v_has_permission THEN
      RAISE NOTICE 'LOG: [get_user_productivity_stats] Usando filtro de usuários específico';
      v_target_user_ids := p_user_ids;
    ELSE
      -- Consultor tentando ver outros usuários → forçar apenas próprios dados
      RAISE NOTICE 'LOG: [get_user_productivity_stats] SEGURANÇA: Consultor restrito aos próprios dados';
      v_target_user_ids := ARRAY[v_current_user_id];
    END IF;
  END IF;

  -- LOG: Calcular data inicial
  v_start_date := date_trunc('day', now() - (p_days_back || ' days')::interval);
  RAISE NOTICE 'LOG: [get_user_productivity_stats] Data inicial: %', v_start_date;

  -- LOG: Construir resultado agregado
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
      -- Dia 1 (últimas 24h)
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 1)::numeric / NULLIF(1, 0), 0)) as day1,
      -- Dia 3 (últimos 3 dias)
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 3)::numeric / NULLIF(3, 0), 0)) as day3,
      -- Dia 7 (últimos 7 dias)
      ROUND(COALESCE(SUM(count) FILTER (WHERE days_ago < 7)::numeric / NULLIF(7, 0), 0)) as day7,
      -- Dia 15 (últimos 15 dias)
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

  -- LOG: Garantir estrutura completa mesmo sem dados (CRÍTICO para TypeScript)
  -- Verificar se todas as 4 chaves existem, senão adicionar com zeros
  IF v_result IS NULL THEN
    v_result := '{}'::jsonb;
  END IF;
  
  -- Garantir que todas as 4 chaves existam
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

  RAISE NOTICE 'LOG: [get_user_productivity_stats] Estatísticas calculadas com sucesso';
  RETURN v_result;
END;
$function$;