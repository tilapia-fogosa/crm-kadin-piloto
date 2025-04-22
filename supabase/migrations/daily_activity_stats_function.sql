
-- Função para buscar estatísticas de atividades diárias
CREATE OR REPLACE FUNCTION get_daily_activity_stats(
  selected_month INT, 
  selected_year INT, 
  selected_unit_ids UUID[]
)
RETURNS TABLE (
  data DATE,
  tentativa_contato BIGINT,
  contato_efetivo BIGINT,
  atendimento_agendado BIGINT,
  atendimento_realizado BIGINT,
  matricula BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dias AS (
    SELECT generate_series(
      date_trunc('month', MAKE_DATE(selected_year, selected_month, 1)),
      LEAST(
        (date_trunc('month', MAKE_DATE(selected_year, selected_month, 1)) + interval '1 month - 1 day'),
        CURRENT_DATE
      ),
      interval '1 day'
    )::date AS data
  )
  SELECT 
    dias.data,
    COUNT(CASE WHEN ca.tipo_atividade = 'Tentativa de Contato' THEN 1 END)::BIGINT as tentativa_contato,
    COUNT(CASE WHEN ca.tipo_atividade = 'Contato Efetivo' THEN 1 END)::BIGINT as contato_efetivo,
    COUNT(CASE WHEN ca.tipo_atividade = 'Agendamento' THEN 1 END)::BIGINT as atendimento_agendado,
    COUNT(CASE WHEN ca.tipo_atividade = 'Atendimento' THEN 1 END)::BIGINT as atendimento_realizado,
    COUNT(CASE WHEN ca.tipo_atividade = 'Matrícula' THEN 1 END)::BIGINT as matricula
  FROM 
    dias
  LEFT JOIN client_activities ca ON 
    DATE(ca.created_at) = dias.data
    AND ca.active = true
    AND ca.unit_id = ANY(selected_unit_ids)
  LEFT JOIN clients c ON 
    ca.client_id = c.id 
    AND c.active = true
  GROUP BY dias.data
  ORDER BY dias.data;
END;
$$;
