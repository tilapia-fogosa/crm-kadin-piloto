-- LOG: Correção completa da função get_horarios_aula_inaugural
-- Problema 1: Conversão de INTEGER para ENUM dia_semana
-- Problema 2: Comparação de sala usando sala_id (UUID) ao invés de sala (TEXT)

-- Etapa 1: Drop função existente
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- Etapa 2: Criar função auxiliar para converter DOW (0-6) para ENUM dia_semana
CREATE OR REPLACE FUNCTION dow_to_dia_semana(dow INTEGER)
RETURNS dia_semana
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE dow
    WHEN 0 THEN 'domingo'::dia_semana
    WHEN 1 THEN 'segunda'::dia_semana
    WHEN 2 THEN 'terca'::dia_semana
    WHEN 3 THEN 'quarta'::dia_semana
    WHEN 4 THEN 'quinta'::dia_semana
    WHEN 5 THEN 'sexta'::dia_semana
    WHEN 6 THEN 'sabado'::dia_semana
    ELSE NULL::dia_semana
  END;
$$;

-- Etapa 3: Recriar função get_horarios_aula_inaugural com TODAS as correções
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
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_horario_inicio TIME;
  v_horario_fim TIME;
BEGIN
  -- LOG: Início da função get_horarios_aula_inaugural
  RAISE NOTICE 'LOG: Buscando horários para data % e unidade %', p_data, p_unit_id;

  -- LOG: Buscar horários min/max das turmas ativas da unidade
  SELECT 
    COALESCE(MIN(horario_inicio), '08:00:00'::TIME),
    COALESCE(MAX(horario_fim), '20:00:00'::TIME)
  INTO v_horario_inicio, v_horario_fim
  FROM turmas
  WHERE unit_id = p_unit_id 
    AND active = true;

  RAISE NOTICE 'LOG: Horário início: %, Horário fim: %', v_horario_inicio, v_horario_fim;

  -- LOG: Gerar slots de 1 hora e verificar disponibilidade
  RETURN QUERY
  WITH slots AS (
    SELECT 
      ts::TIME AS inicio,
      (ts + INTERVAL '1 hour')::TIME AS fim
    FROM generate_series(
      (p_data || ' ' || v_horario_inicio::TEXT)::TIMESTAMP,
      (p_data || ' ' || v_horario_fim::TEXT)::TIMESTAMP - INTERVAL '1 hour',
      INTERVAL '1 hour'
    ) ts
  ),
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      COALESCE(p.prioridade, 999) AS prioridade
    FROM professores p
    WHERE p.unit_id = p_unit_id
      AND p.status = true
  ),
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.unit_id = p_unit_id
      AND s.active = true
  )
  SELECT 
    s.inicio::TEXT,
    s.fim::TEXT,
    pd.id,
    pd.nome,
    pd.prioridade,
    sd.id,
    sd.nome
  FROM slots s
  CROSS JOIN professores_disponiveis pd
  CROSS JOIN salas_disponiveis sd
  WHERE NOT EXISTS (
    -- CORREÇÃO 1: Usar dow_to_dia_semana() para converter INTEGER para ENUM
    -- Verificar conflitos com turmas existentes do professor
    SELECT 1
    FROM turmas t
    WHERE t.professor_id = pd.id
      AND t.active = true
      AND t.dia_semana = dow_to_dia_semana(EXTRACT(DOW FROM p_data)::INTEGER)
      AND (
        (s.inicio >= t.horario_inicio AND s.inicio < t.horario_fim)
        OR (s.fim > t.horario_inicio AND s.fim <= t.horario_fim)
        OR (s.inicio <= t.horario_inicio AND s.fim >= t.horario_fim)
      )
  )
  AND NOT EXISTS (
    -- CORREÇÃO 1 e 2: Usar dow_to_dia_semana() E comparar sala_id (UUID) OU sala (TEXT)
    -- Verificar conflitos com turmas existentes na sala
    SELECT 1
    FROM turmas t
    WHERE (t.sala_id = sd.id OR t.sala = sd.nome)
      AND t.unit_id = p_unit_id
      AND t.active = true
      AND t.dia_semana = dow_to_dia_semana(EXTRACT(DOW FROM p_data)::INTEGER)
      AND (
        (s.inicio >= t.horario_inicio AND s.inicio < t.horario_fim)
        OR (s.fim > t.horario_inicio AND s.fim <= t.horario_fim)
        OR (s.inicio <= t.horario_inicio AND s.fim >= t.horario_fim)
      )
  )
  ORDER BY s.inicio, pd.prioridade, pd.nome, sd.nome;

  RAISE NOTICE 'LOG: Função get_horarios_aula_inaugural executada com sucesso';
END;
$$;