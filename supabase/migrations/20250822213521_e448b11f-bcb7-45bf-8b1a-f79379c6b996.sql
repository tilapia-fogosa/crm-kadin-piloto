-- Função para relatório temporal dos motivos de perda
CREATE OR REPLACE FUNCTION public.get_temporal_loss_reasons_report(
  p_start_date text DEFAULT NULL::text, 
  p_end_date text DEFAULT NULL::text, 
  p_unit_ids uuid[] DEFAULT NULL::uuid[], 
  p_created_by_ids uuid[] DEFAULT NULL::uuid[], 
  p_current_user_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(
  motivo_perda text,
  mes_1_count bigint, mes_1_percent numeric, mes_1_header text,
  mes_2_count bigint, mes_2_percent numeric, mes_2_header text,
  mes_3_count bigint, mes_3_percent numeric, mes_3_header text,
  mes_4_count bigint, mes_4_percent numeric, mes_4_header text,
  mes_5_count bigint, mes_5_percent numeric, mes_5_header text,
  mes_6_count bigint, mes_6_percent numeric, mes_6_header text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_allowed_units uuid[];
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
  mes_headers text[];
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

  -- Gerar headers dos últimos 6 meses
  SELECT ARRAY[
    TO_CHAR(CURRENT_DATE - INTERVAL '0 months', 'YYYY-MM'),
    TO_CHAR(CURRENT_DATE - INTERVAL '1 months', 'YYYY-MM'),
    TO_CHAR(CURRENT_DATE - INTERVAL '2 months', 'YYYY-MM'),
    TO_CHAR(CURRENT_DATE - INTERVAL '3 months', 'YYYY-MM'),
    TO_CHAR(CURRENT_DATE - INTERVAL '4 months', 'YYYY-MM'),
    TO_CHAR(CURRENT_DATE - INTERVAL '5 months', 'YYYY-MM')
  ] INTO mes_headers;

  -- Query principal com pivot temporal
  RETURN QUERY
  WITH filtered_data AS (
    SELECT 
      lr.name as motivo_perda,
      TO_CHAR(clr.created_at, 'YYYY-MM') as mes_ano,
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
      -- Últimos 6 meses
      AND clr.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
    GROUP BY lr.name, TO_CHAR(clr.created_at, 'YYYY-MM')
  ),
  totais_por_mes AS (
    SELECT 
      mes_ano,
      SUM(quantidade) as total_mes
    FROM filtered_data
    GROUP BY mes_ano
  )
  SELECT 
    fd.motivo_perda,
    
    -- Mês 1 (atual)
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[1] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[1] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[1] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[1],
    
    -- Mês 2
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[2] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[2] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[2] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[2],
    
    -- Mês 3
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[3] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[3] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[3] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[3],
    
    -- Mês 4
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[4] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[4] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[4] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[4],
    
    -- Mês 5
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[5] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[5] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[5] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[5],
    
    -- Mês 6
    COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[6] THEN fd.quantidade END), 0)::bigint,
    ROUND(COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[6] THEN fd.quantidade END), 0)::numeric / 
          NULLIF(MAX(CASE WHEN tpm.mes_ano = mes_headers[6] THEN tpm.total_mes END), 0) * 100, 1),
    mes_headers[6]
    
  FROM filtered_data fd
  CROSS JOIN totais_por_mes tpm
  GROUP BY fd.motivo_perda
  ORDER BY 
    COALESCE(SUM(fd.quantidade), 0) DESC, 
    fd.motivo_perda;
END;
$function$;