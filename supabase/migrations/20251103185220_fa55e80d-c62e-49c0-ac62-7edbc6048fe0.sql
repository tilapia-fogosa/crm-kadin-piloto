-- Migration: Corrigir função get_horarios_aula_inaugural
-- Remove referência à coluna 'active' que não existe em professores
-- Corrige generate_series para usar TIMESTAMP

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
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_dia_semana INTEGER;
  v_hora_fim TIME;
BEGIN
  -- Log: Início da função
  RAISE NOTICE '[GET_HORARIOS] Iniciando busca para data: %, unit_id: %', p_data, p_unit_id;
  
  -- Determinar dia da semana (0=domingo, 6=sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  RAISE NOTICE '[GET_HORARIOS] Dia da semana: %', v_dia_semana;
  
  -- Definir horário de funcionamento
  IF v_dia_semana = 6 THEN
    v_hora_fim := '12:00'::TIME;
    RAISE NOTICE '[GET_HORARIOS] Sábado - horário até 12:00';
  ELSIF v_dia_semana = 0 THEN
    RAISE NOTICE '[GET_HORARIOS] Domingo - sem horários disponíveis';
    RETURN;
  ELSE
    v_hora_fim := '20:00'::TIME;
    RAISE NOTICE '[GET_HORARIOS] Dia útil - horário até 20:00';
  END IF;

  RETURN QUERY
  WITH 
  -- CTE 1: Gerar slots de 30 minutos
  slots AS (
    SELECT 
      ts::TIME as inicio,
      (ts + INTERVAL '30 minutes')::TIME as fim
    FROM generate_series(
      (p_data + TIME '08:00')::TIMESTAMP,
      (p_data + (v_hora_fim - INTERVAL '30 minutes'))::TIMESTAMP,
      INTERVAL '30 minutes'
    ) ts
  ),
  
  -- CTE 2: Professores livres (com status = true, sem verificar 'active')
  professores_livres AS (
    SELECT DISTINCT
      s.inicio,
      s.fim,
      p.id as professor_id,
      p.nome as professor_nome,
      p.prioridade_aula_inaugural as prioridade
    FROM slots s
    CROSS JOIN professores p
    WHERE p.status = true  -- Apenas professores com status ativo
      AND p.unit_id = p_unit_id
      -- Filtro 1: Não ter turma neste horário
      AND NOT EXISTS (
        SELECT 1 FROM turmas t
        WHERE t.professor_id = p.id
          AND t.unit_id = p_unit_id
          AND p_data = ANY(
            SELECT generate_series(
              t.data_inicio::DATE,
              COALESCE(t.data_fim, p_data)::DATE,
              '1 day'::INTERVAL
            )::DATE
          )
          AND (
            (t.horario_inicio, t.horario_fim) OVERLAPS (s.inicio, s.fim)
          )
      )
      -- Filtro 2: Não ter evento neste horário
      AND NOT EXISTS (
        SELECT 1 FROM eventos_professor ep
        WHERE ep.professor_id = p.id
          AND ep.data_evento = p_data
          AND (ep.horario_inicio, ep.horario_fim) OVERLAPS (s.inicio, s.fim)
      )
      -- Filtro 3: Estar dentro da disponibilidade configurada
      AND EXISTS (
        SELECT 1 FROM disponibilidade_professores dp
        WHERE dp.professor_id = p.id
          AND dp.dia_semana = v_dia_semana
          AND (dp.horario_inicio, dp.horario_fim) OVERLAPS (s.inicio, s.fim)
      )
  ),
  
  -- CTE 3: Salas livres (sem verificar 'active' se não existir)
  salas_livres AS (
    SELECT DISTINCT
      s.inicio,
      s.fim,
      sa.id as sala_id,
      sa.nome as sala_nome
    FROM slots s
    CROSS JOIN salas sa
    WHERE sa.unit_id = p_unit_id
      -- Filtro: Não ter turma usando a sala neste horário
      AND NOT EXISTS (
        SELECT 1 FROM turmas t
        WHERE t.sala_id = sa.id
          AND t.unit_id = p_unit_id
          AND p_data = ANY(
            SELECT generate_series(
              t.data_inicio::DATE,
              COALESCE(t.data_fim, p_data)::DATE,
              '1 day'::INTERVAL
            )::DATE
          )
          AND (t.horario_inicio, t.horario_fim) OVERLAPS (s.inicio, s.fim)
      )
  )
  
  -- Resultado final: Slots com professor E sala disponíveis
  SELECT 
    pl.inicio,
    pl.fim,
    pl.professor_id,
    pl.professor_nome,
    pl.prioridade,
    sl.sala_id,
    sl.sala_nome
  FROM professores_livres pl
  INNER JOIN salas_livres sl
    ON pl.inicio = sl.inicio 
    AND pl.fim = sl.fim
  ORDER BY pl.inicio, pl.prioridade DESC, pl.professor_nome;
  
  RAISE NOTICE '[GET_HORARIOS] Consulta concluída';
END;
$$;