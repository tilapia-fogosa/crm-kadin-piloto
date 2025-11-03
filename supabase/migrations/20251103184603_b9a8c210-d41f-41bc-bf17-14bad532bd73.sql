-- LOG: Migration para refatorar get_horarios_aula_inaugural
-- OBJETIVO: Garantir que slots só apareçam quando AMBOS (professor E sala) estão disponíveis
-- DATA: 2025-11-03

-- LOG: Removendo função antiga
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- LOG: Criando nova função com lógica corrigida
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
SECURITY DEFINER
AS $$
DECLARE
  v_dia_semana INTEGER;
  v_slots_count INTEGER;
  v_professores_count INTEGER;
  v_salas_count INTEGER;
  v_resultado_count INTEGER;
BEGIN
  -- LOG: Identificar dia da semana (0=Domingo, 6=Sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  RAISE NOTICE 'LOG: Data: %, Dia da semana: %', p_data, v_dia_semana;

  -- LOG: Validar se é dia comercial
  IF v_dia_semana = 0 THEN
    RAISE NOTICE 'LOG: Domingo - sem horários comerciais';
    RETURN;
  END IF;

  -- LOG: ETAPA 1 - Gerar slots de tempo (30 minutos)
  RETURN QUERY
  WITH slots_tempo AS (
    SELECT 
      ts::TIME as slot_inicio,
      (ts + INTERVAL '30 minutes')::TIME as slot_fim,
      v_dia_semana as dia_semana
    FROM generate_series(
      '08:00'::TIME,
      CASE 
        WHEN v_dia_semana = 6 THEN '11:30'::TIME  -- Sábado até 12:00 (último slot 11:30-12:00)
        ELSE '19:30'::TIME                         -- Segunda a Sexta até 20:00 (último slot 19:30-20:00)
      END,
      INTERVAL '30 minutes'
    ) ts
  ),
  
  -- LOG: ETAPA 2 - Identificar professores disponíveis por slot
  professores_livres AS (
    SELECT DISTINCT
      st.slot_inicio,
      st.slot_fim,
      p.id as professor_id,
      p.nome as professor_nome,
      p.prioridade
    FROM slots_tempo st
    CROSS JOIN professores p
    WHERE 
      -- Filtro 1: Professor ativo e com status true
      p.status = true 
      AND p.active = true
      AND p.unit_id = p_unit_id
      
      -- Filtro 2: Professor NÃO tem turma conflitante neste horário
      AND NOT EXISTS (
        SELECT 1 
        FROM turmas t
        WHERE t.professor_id = p.id
          AND t.active = true
          AND t.unit_id = p_unit_id
          AND EXTRACT(DOW FROM p_data) = (
            CASE t.dia_semana
              WHEN 'segunda' THEN 1
              WHEN 'terca' THEN 2
              WHEN 'quarta' THEN 3
              WHEN 'quinta' THEN 4
              WHEN 'sexta' THEN 5
              WHEN 'sabado' THEN 6
              ELSE 0
            END
          )
          AND (st.slot_inicio, st.slot_fim) OVERLAPS (t.horario_inicio, t.horario_fim)
      )
      
      -- Filtro 3: Professor NÃO tem evento conflitante neste horário
      AND NOT EXISTS (
        SELECT 1 
        FROM eventos_professor ep
        WHERE ep.professor_id = p.id
          AND ep.active = true
          AND ep.data = p_data
          AND (st.slot_inicio, st.slot_fim) OVERLAPS (ep.horario_inicio, ep.horario_fim)
      )
      
      -- Filtro 4: Professor TEM disponibilidade configurada para este dia/horário
      AND EXISTS (
        SELECT 1 
        FROM disponibilidade_professores dp
        WHERE dp.professor_id = p.id
          AND dp.active = true
          AND EXTRACT(DOW FROM p_data) = (
            CASE dp.dia_semana
              WHEN 'segunda' THEN 1
              WHEN 'terca' THEN 2
              WHEN 'quarta' THEN 3
              WHEN 'quinta' THEN 4
              WHEN 'sexta' THEN 5
              WHEN 'sabado' THEN 6
              ELSE 0
            END
          )
          AND (st.slot_inicio, st.slot_fim) OVERLAPS (dp.horario_inicio, dp.horario_fim)
      )
  ),
  
  -- LOG: ETAPA 3 - Identificar salas disponíveis por slot
  salas_livres AS (
    SELECT DISTINCT
      st.slot_inicio,
      st.slot_fim,
      s.id as sala_id,
      s.nome as sala_nome
    FROM slots_tempo st
    CROSS JOIN salas s
    WHERE 
      -- Filtro 1: Sala ativa
      s.active = true
      AND s.unit_id = p_unit_id
      
      -- Filtro 2: Sala NÃO tem turma ocupando neste horário
      AND NOT EXISTS (
        SELECT 1 
        FROM turmas t
        WHERE t.sala_id = s.id
          AND t.active = true
          AND t.unit_id = p_unit_id
          AND EXTRACT(DOW FROM p_data) = (
            CASE t.dia_semana
              WHEN 'segunda' THEN 1
              WHEN 'terca' THEN 2
              WHEN 'quarta' THEN 3
              WHEN 'quinta' THEN 4
              WHEN 'sexta' THEN 5
              WHEN 'sabado' THEN 6
              ELSE 0
            END
          )
          AND (st.slot_inicio, st.slot_fim) OVERLAPS (t.horario_inicio, t.horario_fim)
      )
  )
  
  -- LOG: ETAPA 4 - Combinar apenas quando AMBOS estão disponíveis (INNER JOIN)
  SELECT 
    pl.slot_inicio,
    pl.slot_fim,
    pl.professor_id,
    pl.professor_nome,
    pl.prioridade,
    sl.sala_id,
    sl.sala_nome
  FROM professores_livres pl
  INNER JOIN salas_livres sl 
    ON pl.slot_inicio = sl.slot_inicio 
    AND pl.slot_fim = sl.slot_fim
  ORDER BY 
    pl.slot_inicio,
    pl.prioridade DESC,  -- Prioridade do professor (maior primeiro)
    pl.professor_nome,
    sl.sala_nome;

  -- LOG: Contadores para debug
  SELECT COUNT(*) INTO v_slots_count FROM slots_tempo;
  SELECT COUNT(DISTINCT professor_id) INTO v_professores_count FROM professores_livres;
  SELECT COUNT(DISTINCT sala_id) INTO v_salas_count FROM salas_livres;
  
  GET DIAGNOSTICS v_resultado_count = ROW_COUNT;
  
  RAISE NOTICE 'LOG: Slots de tempo gerados: %', v_slots_count;
  RAISE NOTICE 'LOG: Professores livres encontrados: %', v_professores_count;
  RAISE NOTICE 'LOG: Salas livres encontradas: %', v_salas_count;
  RAISE NOTICE 'LOG: Combinações finais (professor + sala simultâneos): %', v_resultado_count;
  
END;
$$;

-- LOG: Comentário na função
COMMENT ON FUNCTION get_horarios_aula_inaugural(DATE, UUID) IS 
'Retorna horários disponíveis para aula inaugural garantindo disponibilidade SIMULTÂNEA de professor (status=true) e sala. Usa INNER JOIN para evitar slots impossíveis.';