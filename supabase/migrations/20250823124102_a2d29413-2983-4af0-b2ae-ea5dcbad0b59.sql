-- Corrigir função get_temporal_loss_reasons_report com cálculos de porcentagem corretos
CREATE OR REPLACE FUNCTION public.get_temporal_loss_reasons_report(p_start_date text DEFAULT NULL::text, p_end_date text DEFAULT NULL::text, p_unit_ids uuid[] DEFAULT NULL::uuid[], p_created_by_ids uuid[] DEFAULT NULL::uuid[], p_current_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(motivo_perda text, mes_1_count bigint, mes_1_percent numeric, mes_1_header text, mes_2_count bigint, mes_2_percent numeric, mes_2_header text, mes_3_count bigint, mes_3_percent numeric, mes_3_header text, mes_4_count bigint, mes_4_percent numeric, mes_4_header text, mes_5_count bigint, mes_5_percent numeric, mes_5_header text, mes_6_count bigint, mes_6_percent numeric, mes_6_header text, total_n bigint, total_percent numeric)
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
  -- Calcular total de motivos por mês
  totais_por_mes AS (
    SELECT 
      TO_CHAR(clr.created_at, 'YYYY-MM') as mes_ano,
      COUNT(*)::bigint as total_motivos_mes
    FROM client_loss_reasons clr
    WHERE 
      -- Aplicar mesmos filtros da query principal
      (v_start_date IS NULL OR clr.created_at >= v_start_date)
      AND (v_end_date IS NULL OR clr.created_at <= v_end_date)
      AND (
        p_unit_ids IS NULL 
        OR (
          clr.unit_id = ANY(p_unit_ids) 
          AND clr.unit_id = ANY(user_allowed_units)
        )
      )
      AND (
        p_unit_ids IS NOT NULL 
        OR clr.unit_id = ANY(user_allowed_units)
      )
      AND (p_created_by_ids IS NULL OR clr.created_by = ANY(p_created_by_ids))
      AND clr.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
    GROUP BY TO_CHAR(clr.created_at, 'YYYY-MM')
  ),
  -- Calcular dados agrupados por motivo com joins corretos
  dados_agrupados AS (
    SELECT 
      fd.motivo_perda,
      
      -- Mês 1 (atual)
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[1] THEN fd.quantidade END), 0)::bigint as mes_1_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[1] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[1]), 0) * 100, 1), 0) as mes_1_percent,
      mes_headers[1] as mes_1_header,
      
      -- Mês 2
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[2] THEN fd.quantidade END), 0)::bigint as mes_2_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[2] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[2]), 0) * 100, 1), 0) as mes_2_percent,
      mes_headers[2] as mes_2_header,
      
      -- Mês 3
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[3] THEN fd.quantidade END), 0)::bigint as mes_3_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[3] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[3]), 0) * 100, 1), 0) as mes_3_percent,
      mes_headers[3] as mes_3_header,
      
      -- Mês 4
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[4] THEN fd.quantidade END), 0)::bigint as mes_4_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[4] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[4]), 0) * 100, 1), 0) as mes_4_percent,
      mes_headers[4] as mes_4_header,
      
      -- Mês 5
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[5] THEN fd.quantidade END), 0)::bigint as mes_5_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[5] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[5]), 0) * 100, 1), 0) as mes_5_percent,
      mes_headers[5] as mes_5_header,
      
      -- Mês 6
      COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[6] THEN fd.quantidade END), 0)::bigint as mes_6_count,
      COALESCE(ROUND(SUM(CASE WHEN fd.mes_ano = mes_headers[6] THEN fd.quantidade END)::numeric / 
               NULLIF((SELECT total_motivos_mes FROM totais_por_mes WHERE mes_ano = mes_headers[6]), 0) * 100, 1), 0) as mes_6_percent,
      mes_headers[6] as mes_6_header,
      
      -- Total N (soma horizontal)
      (COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[1] THEN fd.quantidade END), 0) +
       COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[2] THEN fd.quantidade END), 0) +
       COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[3] THEN fd.quantidade END), 0) +
       COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[4] THEN fd.quantidade END), 0) +
       COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[5] THEN fd.quantidade END), 0) +
       COALESCE(SUM(CASE WHEN fd.mes_ano = mes_headers[6] THEN fd.quantidade END), 0))::bigint as total_n_row
      
    FROM filtered_data fd
    GROUP BY fd.motivo_perda
  )
  SELECT 
    da.motivo_perda,
    da.mes_1_count, da.mes_1_percent, da.mes_1_header,
    da.mes_2_count, da.mes_2_percent, da.mes_2_header,
    da.mes_3_count, da.mes_3_percent, da.mes_3_header,
    da.mes_4_count, da.mes_4_percent, da.mes_4_header,
    da.mes_5_count, da.mes_5_percent, da.mes_5_header,
    da.mes_6_count, da.mes_6_percent, da.mes_6_header,
    da.total_n_row as total_n,
    -- Total % usando window function para calcular percentual da linha em relação ao total geral
    ROUND(da.total_n_row::numeric / NULLIF(SUM(da.total_n_row) OVER(), 0) * 100, 1) as total_percent
  FROM dados_agrupados da
  WHERE da.total_n_row > 0  -- Só mostrar motivos que têm pelo menos 1 ocorrência
  ORDER BY da.total_n_row DESC, da.motivo_perda;
END;
$function$