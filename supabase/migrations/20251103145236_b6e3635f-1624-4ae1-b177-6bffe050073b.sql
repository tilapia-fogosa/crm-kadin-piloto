-- LOG: Correção do tipo dia_semana - adicionar cast explícito para comparação
-- Problema: dia_semana é ENUM, precisamos converter para TEXT para comparar
-- Data: 2025-11-03

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
  sala_id UUID,
  sala_nome TEXT,
  prioridade INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_horario_inicio TIME;
  v_horario_fim TIME;
  v_dia_semana INTEGER;
  v_dia_semana_texto TEXT;
BEGIN
  -- LOG: Início da função - determinar dia da semana
  v_dia_semana := EXTRACT(DOW FROM p_data);
  
  -- Converter dia da semana numérico para texto (para turmas)
  v_dia_semana_texto := CASE v_dia_semana
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;

  RAISE NOTICE 'LOG: Buscando slots para data % (dia da semana: % - %)', p_data, v_dia_semana, v_dia_semana_texto;
  
  -- LOG: Definir horário de funcionamento baseado no dia da semana
  IF v_dia_semana = 0 THEN
    -- Domingo: sem atendimento
    RAISE NOTICE 'LOG: Domingo - sem horários disponíveis';
    RETURN;
  ELSIF v_dia_semana = 6 THEN
    -- Sábado: 08:00 às 13:00
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '13:00:00'::TIME;
    RAISE NOTICE 'LOG: Sábado - horário: % até %', v_horario_inicio, v_horario_fim;
  ELSE
    -- Segunda a Sexta: 08:00 às 20:30
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '20:30:00'::TIME;
    RAISE NOTICE 'LOG: Dia útil - horário: % até %', v_horario_inicio, v_horario_fim;
  END IF;

  -- LOG: Retornar combinações de professores, salas e slots horários disponíveis
  RETURN QUERY
  WITH 
  -- CTE 1: Buscar turmas regulares que ocupam professores e salas no dia da semana
  turmas_bloqueadas AS (
    SELECT 
      t.professor_id,
      t.sala_id,
      t.horario_inicio,
      t.horario_fim,
      t.nome as turma_nome
    FROM turmas t
    WHERE t.active = true
      AND t.unit_id = p_unit_id
      -- CORREÇÃO: Cast explícito do ENUM para TEXT
      AND t.dia_semana::text = v_dia_semana_texto
  ),
  -- CTE 2: Combinar todas as fontes de bloqueio (eventos pontuais + turmas regulares)
  agendamentos_bloqueados AS (
    -- Fonte 1: Eventos pontuais de professores na data específica
    SELECT 
      ep.professor_id,
      NULL::uuid as sala_id,
      ep.horario_inicio,
      ep.horario_fim,
      'evento_professor'::text as fonte
    FROM eventos_professor ep
    WHERE ep.data = p_data
      AND ep.active = true
    
    UNION ALL
    
    -- Fonte 2: Eventos pontuais de salas na data específica
    SELECT 
      NULL::uuid as professor_id,
      es.sala_id,
      es.horario_inicio,
      es.horario_fim,
      'evento_sala'::text as fonte
    FROM eventos_sala es
    WHERE es.data = p_data
      AND es.active = true
    
    UNION ALL
    
    -- Fonte 3: Turmas regulares do dia da semana
    SELECT 
      tb.professor_id,
      tb.sala_id,
      tb.horario_inicio,
      tb.horario_fim,
      'turma_regular'::text as fonte
    FROM turmas_bloqueadas tb
  ),
  -- CTE 3: Professores disponíveis da unidade
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      p.prioridade
    FROM professores p
    WHERE p.active = true
      AND p.unit_id = p_unit_id
  ),
  -- CTE 4: Salas disponíveis da unidade
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.active = true
      AND s.unit_id = p_unit_id
  ),
  -- CTE 5: Gerar slots de horário de 1 hora
  slots_horarios AS (
    SELECT 
      t.slot_inicio,
      (t.slot_inicio + interval '1 hour')::TIME as slot_fim
    FROM generate_series(
      v_horario_inicio,
      v_horario_fim - interval '1 hour',
      interval '1 hour'
    ) AS t(slot_inicio)
  )
  -- Query principal: combinar professores × salas × slots e filtrar conflitos
  SELECT 
    sh.slot_inicio,
    sh.slot_fim,
    pd.id as professor_id,
    pd.nome as professor_nome,
    sd.id as sala_id,
    sd.nome as sala_nome,
    pd.prioridade
  FROM slots_horarios sh
  CROSS JOIN professores_disponiveis pd
  CROSS JOIN salas_disponiveis sd
  -- LOG: Verificar conflitos com TODAS as fontes de bloqueio
  WHERE NOT EXISTS (
    SELECT 1 
    FROM agendamentos_bloqueados ab
    WHERE (
      -- Conflito de professor OU sala
      (ab.professor_id = pd.id OR ab.sala_id = sd.id)
      -- Verificação de sobreposição de horários
      -- Dois intervalos se sobrepõem se: A.inicio < B.fim AND A.fim > B.inicio
      AND sh.slot_inicio < ab.horario_fim
      AND sh.slot_fim > ab.horario_inicio
    )
  )
  ORDER BY 
    sh.slot_inicio,  -- Ordenar por horário primeiro
    pd.prioridade,   -- Depois por prioridade do professor
    pd.nome,         -- Depois por nome do professor
    sd.nome;         -- Por último por nome da sala

  -- LOG: Estatísticas de bloqueios
  RAISE NOTICE 'LOG: Turmas bloqueadas: %', (SELECT COUNT(*) FROM turmas_bloqueadas);
  RAISE NOTICE 'LOG: Total de bloqueios: %', (SELECT COUNT(*) FROM agendamentos_bloqueados);
  RAISE NOTICE 'LOG: Bloqueios por fonte - eventos_professor: %, eventos_sala: %, turmas_regular: %',
    (SELECT COUNT(*) FROM agendamentos_bloqueados WHERE fonte = 'evento_professor'),
    (SELECT COUNT(*) FROM agendamentos_bloqueados WHERE fonte = 'evento_sala'),
    (SELECT COUNT(*) FROM agendamentos_bloqueados WHERE fonte = 'turma_regular');
    
END;
$$;

COMMENT ON FUNCTION get_horarios_aula_inaugural IS 'Retorna slots disponíveis para aula inaugural considerando: 1) Eventos pontuais de professores, 2) Eventos pontuais de salas, 3) Turmas regulares do dia da semana. Verifica conflitos de horário entre professor/sala ocupados e slots disponíveis. CORREÇÃO: Cast explícito de ENUM para TEXT na comparação de dia_semana.';