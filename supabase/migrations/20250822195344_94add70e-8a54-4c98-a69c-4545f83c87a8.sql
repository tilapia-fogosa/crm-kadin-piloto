-- Recriar a função get_loss_reasons_report com tipos corretos
DROP FUNCTION IF EXISTS public.get_loss_reasons_report(timestamp with time zone, timestamp with time zone, uuid[], uuid[], uuid);

CREATE OR REPLACE FUNCTION public.get_loss_reasons_report(
  p_start_date text DEFAULT NULL,
  p_end_date text DEFAULT NULL, 
  p_unit_ids uuid[] DEFAULT NULL,
  p_created_by_ids uuid[] DEFAULT NULL,
  p_current_user_id uuid DEFAULT NULL
)
RETURNS TABLE(
  motivo_perda text,
  novo_cadastro bigint,
  tentativa_contato bigint,
  contato_efetivo bigint,
  atendimento_agendado bigint,
  negociacao bigint,
  perdido bigint,
  sem_status_anterior bigint,
  total_motivo bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_allowed_units uuid[];
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
BEGIN
  -- Buscar unidades que o usuário tem acesso
  SELECT array_agg(DISTINCT uu.unit_id)
  INTO user_allowed_units
  FROM unit_users uu
  WHERE uu.user_id = p_current_user_id
    AND uu.active = true;

  -- Se o usuário não tem acesso a nenhuma unidade, retorna vazio
  IF user_allowed_units IS NULL OR array_length(user_allowed_units, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Converter datas de texto para timestamp
  IF p_start_date IS NOT NULL THEN
    v_start_date := p_start_date::timestamp with time zone;
  END IF;
  
  IF p_end_date IS NOT NULL THEN
    v_end_date := p_end_date::timestamp with time zone;
  END IF;

  -- Query principal com pivot
  RETURN QUERY
  WITH filtered_data AS (
    SELECT 
      lr.name as motivo_perda,
      COALESCE(clr.previous_status, 'sem-status-anterior') as previous_status,
      COUNT(*)::bigint as quantidade
    FROM client_loss_reasons clr
    JOIN loss_reasons lr ON clr.reason_id = lr.id
    WHERE 
      -- Filtro de data
      (v_start_date IS NULL OR clr.created_at >= v_start_date)
      AND (v_end_date IS NULL OR clr.created_at <= v_end_date)
      -- Filtro de unidades (intersecção com unidades permitidas ao usuário)
      AND (
        p_unit_ids IS NULL 
        OR (
          clr.unit_id = ANY(p_unit_ids) 
          AND clr.unit_id = ANY(user_allowed_units)
        )
      )
      -- Se não foi especificado filtro de unidades, usar todas as unidades do usuário
      AND (
        p_unit_ids IS NOT NULL 
        OR clr.unit_id = ANY(user_allowed_units)
      )
      -- Filtro de usuário criador
      AND (p_created_by_ids IS NULL OR clr.created_by = ANY(p_created_by_ids))
    GROUP BY lr.name, COALESCE(clr.previous_status, 'sem-status-anterior')
  )
  SELECT 
    fd.motivo_perda,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'novo-cadastro' THEN fd.quantidade END), 0)::bigint as novo_cadastro,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'tentativa-contato' THEN fd.quantidade END), 0)::bigint as tentativa_contato,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'contato-efetivo' THEN fd.quantidade END), 0)::bigint as contato_efetivo,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'atendimento-agendado' THEN fd.quantidade END), 0)::bigint as atendimento_agendado,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'negociacao' THEN fd.quantidade END), 0)::bigint as negociacao,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'perdido' THEN fd.quantidade END), 0)::bigint as perdido,
    COALESCE(SUM(CASE WHEN fd.previous_status = 'sem-status-anterior' THEN fd.quantidade END), 0)::bigint as sem_status_anterior,
    SUM(fd.quantidade)::bigint as total_motivo
  FROM filtered_data fd
  GROUP BY fd.motivo_perda
  ORDER BY total_motivo DESC, fd.motivo_perda;
END;
$function$;