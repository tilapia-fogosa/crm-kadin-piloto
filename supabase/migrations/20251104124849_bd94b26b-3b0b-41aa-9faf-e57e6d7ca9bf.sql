-- LOG: Migration para refatorar agendamento de aula inaugural
-- Remove funções antigas e cria nova função que usa view horarios_ocupados

-- 1. Drop das funções antigas
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);
DROP FUNCTION IF EXISTS bloquear_aula_inaugural(UUID, DATE, TIME, TIME, UUID, UUID, TEXT, UUID);

-- 2. Criar nova função que consulta horarios_ocupados para determinar disponibilidade
CREATE OR REPLACE FUNCTION get_slots_disponiveis_aula_inaugural(
  p_data DATE,
  p_unit_id UUID
)
RETURNS TABLE (
  slot_inicio TIME,
  slot_fim TIME,
  professor_id UUID,
  professor_nome TEXT,
  sala_id UUID,
  sala_nome TEXT,
  prioridade INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_dia_semana TEXT;
  v_horario_inicio TIME;
  v_horario_fim TIME;
  v_duracao_slot INTERVAL := '1 hour';
BEGIN
  -- LOG: Determinar dia da semana da data fornecida
  v_dia_semana := CASE EXTRACT(DOW FROM p_data)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;

  RAISE NOTICE 'LOG: Buscando slots para data %, dia da semana: %', p_data, v_dia_semana;

  -- LOG: Definir horários de funcionamento baseado no dia da semana
  IF v_dia_semana = 'sabado' THEN
    v_horario_inicio := '08:00'::TIME;
    v_horario_fim := '12:00'::TIME;
  ELSIF v_dia_semana = 'domingo' THEN
    -- Domingo não trabalha
    RETURN;
  ELSE
    v_horario_inicio := '08:00'::TIME;
    v_horario_fim := '21:00'::TIME;
  END IF;

  -- LOG: Retornar slots disponíveis
  -- Para cada professor ativo (ordenado por prioridade)
  -- E para cada sala ativa
  -- Verificar disponibilidade no horário de expediente
  RETURN QUERY
  WITH professor_sala_combo AS (
    -- Todas as combinações possíveis de professor + sala da unidade
    SELECT 
      p.id AS professor_id,
      p.nome AS professor_nome,
      p.prioridade,
      s.id AS sala_id,
      s.nome AS sala_nome
    FROM professores p
    CROSS JOIN salas s
    WHERE p.unit_id = p_unit_id
      AND p.status = true
      AND s.unit_id = p_unit_id
      AND s.active = true
  ),
  time_slots AS (
    -- Gerar slots de 1 hora dentro do horário de expediente
    SELECT 
      t AS inicio,
      t + v_duracao_slot AS fim
    FROM generate_series(
      v_horario_inicio,
      v_horario_fim - v_duracao_slot,
      v_duracao_slot
    ) t
  ),
  occupied_slots AS (
    -- Buscar todos os horários ocupados para a data/dia da semana
    SELECT DISTINCT
      ho.professor_id,
      ho.sala_id,
      ho.horario_inicio,
      ho.horario_fim
    FROM horarios_ocupados ho
    WHERE (
      -- Data específica corresponde
      ho.data_especifica = p_data
      OR
      -- Dia da semana corresponde e não tem data específica (recorrente)
      (ho.dia_semana = v_dia_semana AND ho.data_especifica IS NULL)
    )
    AND ho.unit_id = p_unit_id
  )
  -- Retornar apenas combinações disponíveis
  SELECT 
    ts.inicio,
    ts.fim,
    psc.professor_id,
    psc.professor_nome,
    psc.sala_id,
    psc.sala_nome,
    psc.prioridade
  FROM professor_sala_combo psc
  CROSS JOIN time_slots ts
  WHERE NOT EXISTS (
    -- Verificar se há conflito de horário para o professor OU sala
    SELECT 1
    FROM occupied_slots os
    WHERE (
      os.professor_id = psc.professor_id
      OR os.sala_id = psc.sala_id
    )
    AND (
      -- Sobreposição de horários
      (ts.inicio >= os.horario_inicio AND ts.inicio < os.horario_fim)
      OR (ts.fim > os.horario_inicio AND ts.fim <= os.horario_fim)
      OR (ts.inicio <= os.horario_inicio AND ts.fim >= os.horario_fim)
    )
  )
  ORDER BY psc.prioridade ASC, ts.inicio ASC;
  
  RAISE NOTICE 'LOG: Slots disponíveis retornados com sucesso';
END;
$$;