-- LOG: Dropar função existente para permitir alteração do tipo de retorno
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- LOG: Recriar função get_horarios_aula_inaugural com correção do generate_series
-- PROBLEMA: generate_series não suporta tipo TIME, apenas TIMESTAMP
-- SOLUÇÃO: Converter TIME para TIMESTAMP usando a data fornecida

CREATE OR REPLACE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID
)
RETURNS TABLE (
  slot_inicio TEXT,
  slot_fim TEXT,
  professor_id UUID,
  professor_nome TEXT,
  prioridade INTEGER,
  sala_id UUID,
  sala_nome TEXT
) AS $$
DECLARE
  v_horario_inicio TIME;
  v_horario_fim TIME;
BEGIN
  -- LOG: Buscar horário de funcionamento da unidade
  SELECT start_time, end_time
  INTO v_horario_inicio, v_horario_fim
  FROM units
  WHERE id = p_unit_id;

  -- LOG: Validar se encontrou horários
  IF v_horario_inicio IS NULL OR v_horario_fim IS NULL THEN
    RAISE EXCEPTION 'Horários não encontrados para a unidade %', p_unit_id;
  END IF;

  RETURN QUERY
  WITH 
  -- LOG: Gerar slots de horário (conversão TIME -> TIMESTAMP -> TIME)
  slots_horarios AS (
    SELECT 
      (t.slot_completo)::TIME as slot_inicio,
      (t.slot_completo + interval '1 hour')::TIME as slot_fim
    FROM generate_series(
      (p_data || ' ' || v_horario_inicio::TEXT)::TIMESTAMP,
      (p_data || ' ' || v_horario_fim::TEXT)::TIMESTAMP - interval '1 hour',
      interval '1 hour'
    ) AS t(slot_completo)
  ),
  
  -- LOG: Buscar turmas regulares que acontecem no dia da semana
  turmas_conflito AS (
    SELECT DISTINCT
      t.professor_id,
      t.sala_id,
      t.start_time as hora_inicio,
      (t.start_time::TIME + t.duration * interval '1 minute')::TIME as hora_fim
    FROM turmas t
    WHERE t.unit_id = p_unit_id
      AND t.active = true
      AND LOWER(t.dia_semana::TEXT) = LOWER(TO_CHAR(p_data, 'Day'))
  ),
  
  -- LOG: Buscar eventos de professor no dia específico
  eventos_prof AS (
    SELECT DISTINCT
      ep.professor_id,
      ep.start_time::TIME as hora_inicio,
      ep.end_time::TIME as hora_fim
    FROM eventos_professor ep
    WHERE DATE(ep.start_time) = p_data
      AND ep.unit_id = p_unit_id
  ),
  
  -- LOG: Buscar eventos de sala no dia específico
  eventos_salas AS (
    SELECT DISTINCT
      es.sala_id,
      es.start_time::TIME as hora_inicio,
      es.end_time::TIME as hora_fim
    FROM eventos_sala es
    WHERE DATE(es.start_time) = p_data
      AND es.unit_id = p_unit_id
  ),
  
  -- LOG: Combinar professores e salas disponíveis com priorização
  combinacoes_disponiveis AS (
    SELECT 
      sh.slot_inicio,
      sh.slot_fim,
      p.id as professor_id,
      p.nome as professor_nome,
      CASE 
        WHEN p.tipo_contrato = 'clt' THEN 1
        WHEN p.tipo_contrato = 'pj' THEN 2
        ELSE 3
      END as prioridade,
      s.id as sala_id,
      s.nome as sala_nome
    FROM slots_horarios sh
    CROSS JOIN professores p
    CROSS JOIN salas s
    WHERE p.unit_id = p_unit_id
      AND p.status = true
      AND s.unit_id = p_unit_id
      AND s.active = true
      -- LOG: Filtrar professor sem conflito de turma regular
      AND NOT EXISTS (
        SELECT 1 FROM turmas_conflito tc
        WHERE tc.professor_id = p.id
          AND (
            (sh.slot_inicio >= tc.hora_inicio AND sh.slot_inicio < tc.hora_fim) OR
            (sh.slot_fim > tc.hora_inicio AND sh.slot_fim <= tc.hora_fim) OR
            (sh.slot_inicio <= tc.hora_inicio AND sh.slot_fim >= tc.hora_fim)
          )
      )
      -- LOG: Filtrar sala sem conflito de turma regular
      AND NOT EXISTS (
        SELECT 1 FROM turmas_conflito tc
        WHERE tc.sala_id = s.id
          AND (
            (sh.slot_inicio >= tc.hora_inicio AND sh.slot_inicio < tc.hora_fim) OR
            (sh.slot_fim > tc.hora_inicio AND sh.slot_fim <= tc.hora_fim) OR
            (sh.slot_inicio <= tc.hora_inicio AND sh.slot_fim >= tc.hora_fim)
          )
      )
      -- LOG: Filtrar professor sem evento específico
      AND NOT EXISTS (
        SELECT 1 FROM eventos_prof ep
        WHERE ep.professor_id = p.id
          AND (
            (sh.slot_inicio >= ep.hora_inicio AND sh.slot_inicio < ep.hora_fim) OR
            (sh.slot_fim > ep.hora_inicio AND sh.slot_fim <= ep.hora_fim) OR
            (sh.slot_inicio <= ep.hora_inicio AND sh.slot_fim >= ep.hora_fim)
          )
      )
      -- LOG: Filtrar sala sem evento específico
      AND NOT EXISTS (
        SELECT 1 FROM eventos_salas es
        WHERE es.sala_id = s.id
          AND (
            (sh.slot_inicio >= es.hora_inicio AND sh.slot_inicio < es.hora_fim) OR
            (sh.slot_fim > es.hora_inicio AND sh.slot_fim <= es.hora_fim) OR
            (sh.slot_inicio <= es.hora_inicio AND sh.slot_fim >= es.hora_fim)
          )
      )
  )
  
  -- LOG: Retornar slots disponíveis priorizados
  SELECT 
    cd.slot_inicio::TEXT,
    cd.slot_fim::TEXT,
    cd.professor_id,
    cd.professor_nome,
    cd.prioridade,
    cd.sala_id,
    cd.sala_nome
  FROM combinacoes_disponiveis cd
  ORDER BY cd.slot_inicio, cd.prioridade, cd.professor_nome, cd.sala_nome;
END;
$$ LANGUAGE plpgsql;