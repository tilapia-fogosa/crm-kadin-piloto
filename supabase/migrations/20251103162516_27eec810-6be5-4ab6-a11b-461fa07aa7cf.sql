-- LOG: Corrigir get_horarios_aula_inaugural para usar horários das turmas
-- Remove busca de colunas inexistentes (start_time, end_time) da tabela units
-- Busca horários das turmas ativas da unidade

DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

CREATE OR REPLACE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID
)
RETURNS TABLE (
  slot_inicio TIME,
  slot_fim TIME,
  professor_id UUID,
  professor_nome TEXT,
  prioridade INTEGER,
  sala_id UUID,
  sala_nome TEXT
) AS $$
DECLARE
  v_horario_inicio TIME;
  v_horario_fim TIME;
  v_dia_semana TEXT;
BEGIN
  -- LOG: Determinar horários baseados nas turmas da unidade
  SELECT 
    COALESCE(MIN(t.horario_inicio), '08:00:00'::TIME),
    COALESCE(MAX(t.horario_fim), '20:00:00'::TIME)
  INTO v_horario_inicio, v_horario_fim
  FROM turmas t
  WHERE t.unit_id = p_unit_id 
    AND t.active = true;

  RAISE NOTICE 'LOG: Horários da unidade: % - %', v_horario_inicio, v_horario_fim;

  -- LOG: Determinar dia da semana da data solicitada
  v_dia_semana := CASE EXTRACT(DOW FROM p_data)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda'
    WHEN 2 THEN 'Terça'
    WHEN 3 THEN 'Quarta'
    WHEN 4 THEN 'Quinta'
    WHEN 5 THEN 'Sexta'
    WHEN 6 THEN 'Sábado'
  END;

  RAISE NOTICE 'LOG: Data: %, Dia da semana: %', p_data, v_dia_semana;

  -- LOG: Gerar slots de 1 hora e verificar disponibilidade
  RETURN QUERY
  WITH slots_horarios AS (
    -- Gerar slots de 1 hora entre horário inicial e final
    SELECT 
      (p_data + ts)::TIME as horario_inicio,
      (p_data + ts + INTERVAL '1 hour')::TIME as horario_fim
    FROM generate_series(
      p_data + v_horario_inicio,
      p_data + v_horario_fim - INTERVAL '1 hour',
      INTERVAL '1 hour'
    ) ts
  ),
  turmas_conflitantes AS (
    -- Turmas regulares que ocorrem no dia da semana
    SELECT 
      t.horario_inicio,
      t.horario_fim,
      t.professor_id,
      t.sala_id
    FROM turmas t
    WHERE t.unit_id = p_unit_id
      AND t.active = true
      AND t.dia_semana = v_dia_semana
  ),
  aulas_inaugurais_agendadas AS (
    -- Aulas inaugurais já agendadas para esta data
    SELECT 
      ai.horario_inicio,
      ai.horario_fim,
      ai.professor_id,
      ai.sala_id
    FROM aula_inaugural ai
    WHERE ai.data_aula = p_data
      AND ai.unit_id = p_unit_id
  ),
  aulas_experimentais_agendadas AS (
    -- Aulas experimentais já agendadas para esta data
    SELECT 
      ae.horario_inicio,
      ae.horario_fim,
      ae.professor_id,
      ae.sala_id
    FROM aula_experimental ae
    WHERE ae.data_aula = p_data
      AND ae.unit_id = p_unit_id
  ),
  eventos_professor AS (
    -- Eventos de professor na data
    SELECT 
      ep.horario_inicio,
      ep.horario_fim,
      ep.professor_id
    FROM professor_events ep
    WHERE ep.data_evento = p_data
      AND ep.unit_id = p_unit_id
  ),
  eventos_sala AS (
    -- Eventos de sala na data
    SELECT 
      es.horario_inicio,
      es.horario_fim,
      es.sala_id
    FROM sala_events es
    WHERE es.data_evento = p_data
      AND es.unit_id = p_unit_id
  ),
  professores_disponiveis AS (
    -- Professores disponíveis por slot
    SELECT 
      sh.horario_inicio,
      sh.horario_fim,
      p.id as professor_id,
      p.name as professor_nome,
      -- Prioridade: professores sem turmas regulares têm prioridade 1
      CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM turmas t 
          WHERE t.professor_id = p.id 
            AND t.unit_id = p_unit_id 
            AND t.active = true
        ) THEN 1
        ELSE 2
      END as prioridade
    FROM slots_horarios sh
    CROSS JOIN professors p
    WHERE p.unit_id = p_unit_id
      AND p.active = true
      -- Professor não tem turma regular neste horário
      AND NOT EXISTS (
        SELECT 1 FROM turmas_conflitantes tc
        WHERE tc.professor_id = p.id
          AND (
            (sh.horario_inicio >= tc.horario_inicio AND sh.horario_inicio < tc.horario_fim)
            OR (sh.horario_fim > tc.horario_inicio AND sh.horario_fim <= tc.horario_fim)
            OR (sh.horario_inicio <= tc.horario_inicio AND sh.horario_fim >= tc.horario_fim)
          )
      )
      -- Professor não tem aula inaugural neste horário
      AND NOT EXISTS (
        SELECT 1 FROM aulas_inaugurais_agendadas aia
        WHERE aia.professor_id = p.id
          AND (
            (sh.horario_inicio >= aia.horario_inicio AND sh.horario_inicio < aia.horario_fim)
            OR (sh.horario_fim > aia.horario_inicio AND sh.horario_fim <= aia.horario_fim)
            OR (sh.horario_inicio <= aia.horario_inicio AND sh.horario_fim >= aia.horario_fim)
          )
      )
      -- Professor não tem aula experimental neste horário
      AND NOT EXISTS (
        SELECT 1 FROM aulas_experimentais_agendadas aea
        WHERE aea.professor_id = p.id
          AND (
            (sh.horario_inicio >= aea.horario_inicio AND sh.horario_inicio < aea.horario_fim)
            OR (sh.horario_fim > aea.horario_inicio AND sh.horario_fim <= aea.horario_fim)
            OR (sh.horario_inicio <= aea.horario_inicio AND sh.horario_fim >= aea.horario_fim)
          )
      )
      -- Professor não tem evento neste horário
      AND NOT EXISTS (
        SELECT 1 FROM eventos_professor ep
        WHERE ep.professor_id = p.id
          AND (
            (sh.horario_inicio >= ep.horario_inicio AND sh.horario_inicio < ep.horario_fim)
            OR (sh.horario_fim > ep.horario_inicio AND sh.horario_fim <= ep.horario_fim)
            OR (sh.horario_inicio <= ep.horario_inicio AND sh.horario_fim >= ep.horario_fim)
          )
      )
  ),
  salas_disponiveis AS (
    -- Salas disponíveis por slot e professor
    SELECT 
      pd.horario_inicio,
      pd.horario_fim,
      pd.professor_id,
      pd.professor_nome,
      pd.prioridade,
      s.id as sala_id,
      s.name as sala_nome
    FROM professores_disponiveis pd
    CROSS JOIN salas s
    WHERE s.unit_id = p_unit_id
      AND s.active = true
      -- Sala não está ocupada por turma regular
      AND NOT EXISTS (
        SELECT 1 FROM turmas_conflitantes tc
        WHERE tc.sala_id = s.id
          AND (
            (pd.horario_inicio >= tc.horario_inicio AND pd.horario_inicio < tc.horario_fim)
            OR (pd.horario_fim > tc.horario_inicio AND pd.horario_fim <= tc.horario_fim)
            OR (pd.horario_inicio <= tc.horario_inicio AND pd.horario_fim >= tc.horario_fim)
          )
      )
      -- Sala não está ocupada por aula inaugural
      AND NOT EXISTS (
        SELECT 1 FROM aulas_inaugurais_agendadas aia
        WHERE aia.sala_id = s.id
          AND (
            (pd.horario_inicio >= aia.horario_inicio AND pd.horario_inicio < aia.horario_fim)
            OR (pd.horario_fim > aia.horario_inicio AND pd.horario_fim <= aia.horario_fim)
            OR (pd.horario_inicio <= aia.horario_inicio AND pd.horario_fim >= aia.horario_fim)
          )
      )
      -- Sala não está ocupada por aula experimental
      AND NOT EXISTS (
        SELECT 1 FROM aulas_experimentais_agendadas aea
        WHERE aea.sala_id = s.id
          AND (
            (pd.horario_inicio >= aea.horario_inicio AND pd.horario_inicio < aea.horario_fim)
            OR (pd.horario_fim > aea.horario_inicio AND pd.horario_fim <= aea.horario_fim)
            OR (pd.horario_inicio <= aea.horario_inicio AND pd.horario_fim >= aea.horario_fim)
          )
      )
      -- Sala não tem evento neste horário
      AND NOT EXISTS (
        SELECT 1 FROM eventos_sala es
        WHERE es.sala_id = s.id
          AND (
            (pd.horario_inicio >= es.horario_inicio AND pd.horario_inicio < es.horario_fim)
            OR (pd.horario_fim > es.horario_inicio AND pd.horario_fim <= es.horario_fim)
            OR (pd.horario_inicio <= es.horario_inicio AND pd.horario_fim >= es.horario_fim)
          )
      )
  )
  -- LOG: Retornar slots disponíveis ordenados por horário e prioridade
  SELECT DISTINCT
    sd.horario_inicio::TIME,
    sd.horario_fim::TIME,
    sd.professor_id,
    sd.professor_nome,
    sd.prioridade,
    sd.sala_id,
    sd.sala_nome
  FROM salas_disponiveis sd
  ORDER BY sd.horario_inicio, sd.prioridade, sd.professor_nome;

  RAISE NOTICE 'LOG: Função get_horarios_aula_inaugural executada com sucesso';
END;
$$ LANGUAGE plpgsql;