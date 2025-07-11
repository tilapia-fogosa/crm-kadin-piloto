-- Log: Criando função RPC para obter leads agrupados por mês e fonte
-- Esta função resolve o problema de limitação de 1000 registros no gráfico do dashboard
-- Agrupa os dados diretamente no SQL para melhor performance

CREATE OR REPLACE FUNCTION get_leads_by_month_and_source(
  p_unit_ids UUID[], 
  p_months_back INTEGER DEFAULT 6
)
RETURNS TABLE(
  month_year TEXT,
  lead_source TEXT,
  lead_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log: Retornando dados de leads agrupados por mês e fonte dos últimos 6 meses
  RETURN QUERY
  SELECT 
    TO_CHAR(c.created_at, 'YYYY-MM') as month_year,
    ls.name as lead_source,
    COUNT(c.id) as lead_count
  FROM clients c
  JOIN lead_sources ls ON c.lead_source = ls.id
  WHERE 
    c.created_at >= CURRENT_DATE - INTERVAL '1 month' * p_months_back
    AND c.active = true
    AND (
      p_unit_ids IS NULL 
      OR array_length(p_unit_ids, 1) IS NULL 
      OR c.unit_id = ANY(p_unit_ids)
    )
  GROUP BY 
    TO_CHAR(c.created_at, 'YYYY-MM'),
    ls.name
  ORDER BY 
    month_year DESC, 
    ls.name;
END;
$$;