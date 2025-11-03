-- =============================================
-- LOG: Sistema de Agendamento de Aula Inaugural
-- Funções para verificar disponibilidade e bloquear recursos
-- =============================================

-- FUNÇÃO 1: Buscar horários disponíveis para aula inaugural
-- LOG: Retorna slots de 1 hora com professor (priorizado) e sala disponíveis
CREATE OR REPLACE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID
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
  v_intervalo INTERVAL := '30 minutes';
BEGIN
  RAISE NOTICE 'LOG: Buscando horários de aula inaugural para data % e unidade %', p_data, p_unit_id;
  
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

  RETURN QUERY
  WITH 
  -- Gerar todos os slots de 30min
  time_slots AS (
    SELECT generate_series(
      v_horario_inicio,
      v_horario_fim - INTERVAL '1 hour',
      v_intervalo
    )::TIME AS slot_inicio
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
  
  -- Ocupações de professores: turmas regulares
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
  
  -- Ocupações de salas: turmas regulares
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
      ts.slot_inicio + INTERVAL '1 hour' AS slot_fim,
      
      -- Melhor professor disponível (menor prioridade)
      (
        SELECT p.id
        FROM professores_disponiveis p
        WHERE NOT EXISTS (
          SELECT 1 FROM todas_ocupacoes_prof op
          WHERE op.professor_id = p.id
            AND ts.slot_inicio < op.fim 
            AND (ts.slot_inicio + INTERVAL '1 hour') > op.inicio
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
            AND (ts.slot_inicio + INTERVAL '1 hour') > os.inicio
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
  
  RAISE NOTICE 'LOG: Consulta de horários concluída';
END;
$$;

-- FUNÇÃO 2: Bloquear recursos (professor e sala) para aula inaugural
-- LOG: Remove bloqueios antigos e cria novos eventos
CREATE OR REPLACE FUNCTION bloquear_aula_inaugural(
  p_activity_id UUID,
  p_data DATE,
  p_horario_inicio TIME,
  p_horario_fim TIME,
  p_professor_id UUID,
  p_sala_id UUID,
  p_client_name TEXT,
  p_unit_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_evento_professor_id UUID;
  v_evento_sala_id UUID;
  v_old_prof_evento_id UUID;
  v_old_sala_evento_id UUID;
BEGIN
  RAISE NOTICE 'LOG: Bloqueando aula inaugural para atividade %', p_activity_id;
  
  -- 1. REMOVER BLOQUEIOS ANTIGOS (se existirem)
  -- Buscar IDs dos eventos antigos vinculados a esta atividade
  SELECT id INTO v_old_prof_evento_id
  FROM eventos_professor 
  WHERE tipo_evento = 'aula_inaugural' 
    AND titulo LIKE '%[' || p_activity_id::TEXT || ']%'
    AND active = true
  LIMIT 1;
  
  SELECT id INTO v_old_sala_evento_id
  FROM eventos_sala
  WHERE tipo_evento = 'aula_inaugural'
    AND titulo LIKE '%[' || p_activity_id::TEXT || ']%'
    AND active = true
  LIMIT 1;
  
  -- Desativar eventos antigos
  IF v_old_prof_evento_id IS NOT NULL THEN
    UPDATE eventos_professor 
    SET active = false, updated_at = NOW()
    WHERE id = v_old_prof_evento_id;
    
    RAISE NOTICE 'LOG: Evento antigo de professor desativado: %', v_old_prof_evento_id;
  END IF;
  
  IF v_old_sala_evento_id IS NOT NULL THEN
    UPDATE eventos_sala
    SET active = false, updated_at = NOW()
    WHERE id = v_old_sala_evento_id;
    
    RAISE NOTICE 'LOG: Evento antigo de sala desativado: %', v_old_sala_evento_id;
  END IF;
  
  -- 2. CRIAR NOVO BLOQUEIO DE PROFESSOR (global, sem unit_id)
  INSERT INTO eventos_professor (
    professor_id,
    tipo_evento,
    titulo,
    descricao,
    data,
    horario_inicio,
    horario_fim,
    recorrente,
    active,
    created_by
  ) VALUES (
    p_professor_id,
    'aula_inaugural',
    'Aula Inaugural - ' || p_client_name || ' [' || p_activity_id || ']',
    'Aula inaugural agendada automaticamente pelo sistema de pós-venda',
    p_data,
    p_horario_inicio,
    p_horario_fim,
    false,
    true,
    auth.uid()
  )
  RETURNING id INTO v_evento_professor_id;
  
  RAISE NOTICE 'LOG: Evento de professor criado: %', v_evento_professor_id;
  
  -- 3. CRIAR NOVO BLOQUEIO DE SALA (com unit_id)
  INSERT INTO eventos_sala (
    sala_id,
    tipo_evento,
    titulo,
    descricao,
    data,
    horario_inicio,
    horario_fim,
    responsavel_id,
    responsavel_tipo,
    recorrente,
    unit_id,
    active,
    created_by
  ) VALUES (
    p_sala_id,
    'aula_inaugural',
    'Aula Inaugural - ' || p_client_name || ' [' || p_activity_id || ']',
    'Aula inaugural agendada automaticamente pelo sistema de pós-venda',
    p_data,
    p_horario_inicio,
    p_horario_fim,
    p_professor_id,
    'professor',
    false,
    p_unit_id,
    true,
    auth.uid()
  )
  RETURNING id INTO v_evento_sala_id;
  
  RAISE NOTICE 'LOG: Evento de sala criado: %', v_evento_sala_id;
  
  -- 4. RETORNAR IDs dos eventos criados
  RETURN jsonb_build_object(
    'professor_evento_id', v_evento_professor_id,
    'sala_evento_id', v_evento_sala_id,
    'old_prof_evento_removed', v_old_prof_evento_id,
    'old_sala_evento_removed', v_old_sala_evento_id
  );
END;
$$;

-- FUNÇÃO 3: Cancelar aula inaugural
-- LOG: Desativa eventos de professor e sala vinculados à atividade
CREATE OR REPLACE FUNCTION cancelar_aula_inaugural(
  p_activity_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows_updated INTEGER := 0;
BEGIN
  RAISE NOTICE 'LOG: Cancelando aula inaugural para atividade %', p_activity_id;
  
  -- Desativar evento do professor
  UPDATE eventos_professor
  SET active = false, updated_at = NOW()
  WHERE tipo_evento = 'aula_inaugural'
    AND titulo LIKE '%[' || p_activity_id::TEXT || ']%'
    AND active = true;
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RAISE NOTICE 'LOG: Eventos de professor desativados: %', v_rows_updated;
  
  -- Desativar evento da sala
  UPDATE eventos_sala
  SET active = false, updated_at = NOW()
  WHERE tipo_evento = 'aula_inaugural'
    AND titulo LIKE '%[' || p_activity_id::TEXT || ']%'
    AND active = true;
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RAISE NOTICE 'LOG: Eventos de sala desativados: %', v_rows_updated;
  
  RAISE NOTICE 'LOG: Cancelamento de aula inaugural concluído';
  RETURN true;
END;
$$;