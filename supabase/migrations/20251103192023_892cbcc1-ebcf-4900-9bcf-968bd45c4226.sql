-- LOG: Correção completa da função get_horarios_aula_inaugural
-- Remove RAISE NOTICE após RETURN QUERY (erro crítico)
-- Adiciona filtros IS NOT NULL para horários
-- Otimiza conversão de dia_semana para ENUM

DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

CREATE OR REPLACE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID
)
RETURNS TABLE (
  horario_inicio TIME,
  horario_fim TIME,
  professor_id UUID,
  professor_nome TEXT,
  sala_id UUID,
  sala_nome TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_dia_semana INTEGER;
  v_dia_semana_text TEXT;
BEGIN
  -- LOG: Iniciando busca de horários para aula inaugural
  RAISE NOTICE 'Buscando horários para data: % e unidade: %', p_data, p_unit_id;
  
  -- Obter dia da semana (0=domingo, 6=sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  
  -- Converter para texto compatível com ENUM dia_semana
  v_dia_semana_text := CASE v_dia_semana
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;
  
  RAISE NOTICE 'Dia da semana: % (%)', v_dia_semana, v_dia_semana_text;
  
  -- Não retornar horários para domingo
  IF v_dia_semana = 0 THEN
    RAISE NOTICE 'Domingo - sem horários disponíveis';
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH slots_possiveis AS (
    -- Gerar slots de 30 minutos dentro do horário comercial
    SELECT 
      h.horario_inicio,
      h.horario_inicio + INTERVAL '30 minutes' AS horario_fim
    FROM horarios_comerciais h
    WHERE h.unit_id = p_unit_id
      AND h.dia_semana = v_dia_semana_text::dia_semana
      AND h.ativo = true
  ),
  professores_livres AS (
    SELECT DISTINCT
      p.id AS professor_id,
      p.nome AS professor_nome,
      s.horario_inicio,
      s.horario_fim
    FROM professores p
    CROSS JOIN slots_possiveis s
    WHERE p.unit_id = p_unit_id
      AND p.ativo = true
      -- Verificar disponibilidade do professor (opcional - se não tem registro, considera disponível)
      AND (
        NOT EXISTS (
          SELECT 1 FROM disponibilidade_professores dp 
          WHERE dp.professor_id = p.id
        )
        OR EXISTS (
          SELECT 1 
          FROM disponibilidade_professores dp
          WHERE dp.professor_id = p.id
            AND dp.dia_semana = v_dia_semana_text::dia_semana
            AND dp.ativo = true
            AND (s.horario_inicio, s.horario_fim) OVERLAPS 
                (dp.horario_inicio, dp.horario_fim)
        )
      )
      -- Verificar se professor não está em turma neste horário e dia
      AND NOT EXISTS (
        SELECT 1 
        FROM turmas t
        WHERE t.professor_id = p.id
          AND t.ativo = true
          AND t.dia_semana = v_dia_semana_text::dia_semana
          AND t.horario_inicio IS NOT NULL 
          AND t.horario_fim IS NOT NULL
          AND (s.horario_inicio, s.horario_fim) OVERLAPS 
              (t.horario_inicio, t.horario_fim)
      )
      -- Verificar se professor não tem aula inaugural agendada neste horário e data
      AND NOT EXISTS (
        SELECT 1 
        FROM aulas_inaugurais ai
        WHERE ai.professor_id = p.id
          AND ai.data = p_data
          AND ai.status IN ('agendada', 'confirmada')
          AND (s.horario_inicio, s.horario_fim) OVERLAPS 
              (ai.horario_inicio, ai.horario_fim)
      )
  ),
  salas_livres AS (
    SELECT DISTINCT
      sa.id AS sala_id,
      sa.nome AS sala_nome,
      s.horario_inicio,
      s.horario_fim
    FROM salas sa
    CROSS JOIN slots_possiveis s
    WHERE sa.unit_id = p_unit_id
      AND sa.ativo = true
      -- Verificar se sala não está ocupada por turma neste horário e dia
      AND NOT EXISTS (
        SELECT 1 
        FROM turmas t
        WHERE t.sala_id = sa.id
          AND t.ativo = true
          AND t.dia_semana = v_dia_semana_text::dia_semana
          AND t.horario_inicio IS NOT NULL 
          AND t.horario_fim IS NOT NULL
          AND (s.horario_inicio, s.horario_fim) OVERLAPS 
              (t.horario_inicio, t.horario_fim)
      )
      -- Verificar se sala não tem aula inaugural agendada neste horário e data
      AND NOT EXISTS (
        SELECT 1 
        FROM aulas_inaugurais ai
        WHERE ai.sala_id = sa.id
          AND ai.data = p_data
          AND ai.status IN ('agendada', 'confirmada')
          AND (s.horario_inicio, s.horario_fim) OVERLAPS 
              (ai.horario_inicio, ai.horario_fim)
      )
  )
  SELECT 
    pl.horario_inicio,
    pl.horario_fim,
    pl.professor_id,
    pl.professor_nome,
    sl.sala_id,
    sl.sala_nome
  FROM professores_livres pl
  INNER JOIN salas_livres sl 
    ON pl.horario_inicio = sl.horario_inicio 
    AND pl.horario_fim = sl.horario_fim
  INNER JOIN professores p ON p.id = pl.professor_id
  ORDER BY 
    pl.horario_inicio,
    COALESCE(p.prioridade, 999),
    pl.professor_nome;
    
END;
$$;