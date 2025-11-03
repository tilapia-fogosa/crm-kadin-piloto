-- =============================================
-- LOG: Correção da função get_horarios_aula_inaugural
-- Corrige o erro do generate_series com TIME
-- =============================================

CREATE OR REPLACE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID DEFAULT NULL -- Parâmetro mantido para compatibilidade mas não usado
)
RETURNS TABLE(
  horario_inicio TIME,
  horario_fim TIME,
  professor_id UUID,
  professor_nome TEXT,
  professor_prioridade INTEGER,
  sala_id UUID,
  sala_nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dia_semana TEXT;
  v_horario_inicio TIME;
  v_horario_fim TIME;
  v_base_timestamp TIMESTAMP;
BEGIN
  RAISE NOTICE 'LOG: Buscando horários de aula inaugural para data % (todas as unidades)', p_data;
  
  -- Determinar dia da semana
  v_dia_semana := CASE EXTRACT(DOW FROM p_data)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terça'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sábado'
  END;

  RAISE NOTICE 'LOG: Dia da semana: %', v_dia_semana;

  -- Horários de funcionamento
  IF v_dia_semana = 'sábado' THEN
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '12:00:00'::TIME;
  ELSIF v_dia_semana IN ('domingo') THEN
    RAISE NOTICE 'LOG: Domingo não tem horários disponíveis';
    RETURN;
  ELSE
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '18:00:00'::TIME;
  END IF;

  RAISE NOTICE 'LOG: Horário de funcionamento: % até %', v_horario_inicio, v_horario_fim;
  
  -- Base timestamp para o generate_series
  v_base_timestamp := p_data::TIMESTAMP;

  RETURN QUERY
  WITH 
  -- Gerar todos os slots de 30min usando TIMESTAMP
  time_slots AS (
    SELECT (v_base_timestamp + s)::TIME AS slot_inicio
    FROM generate_series(
      (v_base_timestamp + v_horario_inicio::INTERVAL),
      (v_base_timestamp + v_horario_fim::INTERVAL - INTERVAL '1 hour'),
      INTERVAL '30 minutes'
    ) AS s
  ),
  
  -- Professores ativos (TODAS as unidades)
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      p.prioridade
    FROM professores p
    WHERE p.active = true
      AND p.status = true
  ),
  
  -- Salas ativas (TODAS as unidades)
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.active = true
  ),
  
  -- Ocupações de professores: turmas regulares (TODAS as unidades)
  prof_ocupados_turmas AS (
    SELECT 
      t.professor_id,
      CAST(SPLIT_PART(t.horario, '-', 1) AS TIME) AS inicio,
      CAST(SPLIT_PART(t.horario, '-', 2) AS TIME) AS fim
    FROM turmas t
    WHERE t.active = true
      AND t.dia_semana::TEXT = v_dia_semana
  ),
  
  -- Ocupações de professores: eventos_professor
  prof_ocupados_eventos AS (
    SELECT 
      ep.professor_id,
      ep.horario_inicio AS inicio,
      ep.horario_fim AS fim
    FROM eventos_professor ep
    WHERE ep.active = true
      AND (
        (ep.recorrente = false AND ep.data = p_data)
        OR
        (ep.recorrente = true AND ep.tipo_recorrencia = 'semanal' 
         AND ep.dia_semana::TEXT = v_dia_semana
         AND p_data BETWEEN ep.data_inicio_recorrencia AND COALESCE(ep.data_fim_recorrencia, p_data))
      )
  ),
  
  -- Ocupações de salas: turmas regulares (TODAS as unidades)
  salas_ocupadas_turmas AS (
    SELECT 
      t.sala_id,
      CAST(SPLIT_PART(t.horario, '-', 1) AS TIME) AS inicio,
      CAST(SPLIT_PART(t.horario, '-', 2) AS TIME) AS fim
    FROM turmas t
    WHERE t.active = true
      AND t.sala_id IS NOT NULL
      AND t.dia_semana::TEXT = v_dia_semana
  ),
  
  -- Ocupações de salas: eventos_sala
  salas_ocupadas_eventos AS (
    SELECT 
      es.sala_id,
      es.horario_inicio AS inicio,
      es.horario_fim AS fim
    FROM eventos_sala es
    WHERE es.active = true
      AND (
        (es.recorrente = false AND es.data = p_data)
        OR
        (es.recorrente = true AND es.tipo_recorrencia = 'semanal'
         AND es.dia_semana::TEXT = v_dia_semana
         AND p_data BETWEEN es.data_inicio_recorrencia AND COALESCE(es.data_fim_recorrencia, p_data))
      )
  ),
  
  -- Combinar todas as ocupações de professores
  todas_ocupacoes_prof AS (
    SELECT * FROM prof_ocupados_turmas
    UNION ALL
    SELECT * FROM prof_ocupados_eventos
  ),
  
  -- Combinar todas as ocupações de salas
  todas_ocupacoes_salas AS (
    SELECT * FROM salas_ocupadas_turmas
    UNION ALL
    SELECT * FROM salas_ocupadas_eventos
  ),
  
  -- Para cada slot, encontrar professores e salas disponíveis
  slots_com_recursos AS (
    SELECT 
      ts.slot_inicio,
      (ts.slot_inicio::INTERVAL + INTERVAL '1 hour')::TIME AS slot_fim,
      
      -- Melhor professor disponível (menor prioridade)
      (
        SELECT p.id
        FROM professores_disponiveis p
        WHERE NOT EXISTS (
          SELECT 1 FROM todas_ocupacoes_prof op
          WHERE op.professor_id = p.id
            AND ts.slot_inicio < op.fim 
            AND (ts.slot_inicio::INTERVAL + INTERVAL '1 hour')::TIME > op.inicio
        )
        ORDER BY p.prioridade ASC NULLS LAST, p.nome ASC
        LIMIT 1
      ) AS melhor_professor_id,
      
      -- Primeira sala disponível
      (
        SELECT s.id
        FROM salas_disponiveis s
        WHERE NOT EXISTS (
          SELECT 1 FROM todas_ocupacoes_salas os
          WHERE os.sala_id = s.id
            AND ts.slot_inicio < os.fim
            AND (ts.slot_inicio::INTERVAL + INTERVAL '1 hour')::TIME > os.inicio
        )
        ORDER BY s.nome ASC
        LIMIT 1
      ) AS primeira_sala_id
      
    FROM time_slots ts
  )
  
  -- Retornar apenas slots com AMBOS recursos disponíveis
  SELECT 
    scr.slot_inicio::TIME AS horario_inicio,
    scr.slot_fim::TIME AS horario_fim,
    scr.melhor_professor_id AS professor_id,
    pd.nome AS professor_nome,
    pd.prioridade AS professor_prioridade,
    scr.primeira_sala_id AS sala_id,
    sd.nome AS sala_nome
  FROM slots_com_recursos scr
  JOIN professores_disponiveis pd ON pd.id = scr.melhor_professor_id
  JOIN salas_disponiveis sd ON sd.id = scr.primeira_sala_id
  WHERE scr.melhor_professor_id IS NOT NULL
    AND scr.primeira_sala_id IS NOT NULL
  ORDER BY scr.slot_inicio ASC;
  
  RAISE NOTICE 'LOG: Consulta de horários concluída - % slots encontrados', (SELECT COUNT(*) FROM slots_com_recursos WHERE melhor_professor_id IS NOT NULL AND primeira_sala_id IS NOT NULL);
END;
$$;