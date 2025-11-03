-- LOG: Migration para corrigir completamente get_horarios_aula_inaugural
-- OBJETIVO: Implementar horários corretos, buscar de tabelas corretas, filtrar por unidade

-- Drop da função existente
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- LOG: Criação da função corrigida get_horarios_aula_inaugural
-- DESCRIÇÃO: Retorna slots de 1 hora disponíveis para aula inaugural
-- PARÂMETROS:
--   p_data: Data para verificar disponibilidade
--   p_unit_id: ID da unidade para filtrar professores e salas
-- RETORNA: Lista de slots com professor, sala e horários
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
  v_horario_inicio TIME;
  v_horario_fim TIME;
  v_dia_semana INTEGER;
BEGIN
  -- LOG: Registrar entrada da função
  RAISE NOTICE 'LOG: get_horarios_aula_inaugural - Data: %, Unit ID: %', p_data, p_unit_id;
  
  -- LOG: Determinar dia da semana (0=Domingo, 6=Sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  RAISE NOTICE 'LOG: Dia da semana: % (0=Dom, 6=Sáb)', v_dia_semana;
  
  -- LOG: Definir horários baseado no dia da semana
  IF v_dia_semana = 6 THEN 
    -- Sábado: 08:00 às 13:00
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '13:00:00'::TIME;
    RAISE NOTICE 'LOG: Sábado - Horário: % até %', v_horario_inicio, v_horario_fim;
  ELSIF v_dia_semana = 0 THEN 
    -- Domingo: sem atendimento
    RAISE NOTICE 'LOG: Domingo - Sem atendimento, retornando vazio';
    RETURN;
  ELSE 
    -- Segunda a Sexta: 08:00 às 20:30
    v_horario_inicio := '08:00:00'::TIME;
    v_horario_fim := '20:30:00'::TIME;
    RAISE NOTICE 'LOG: Dia útil - Horário: % até %', v_horario_inicio, v_horario_fim;
  END IF;

  -- LOG: Retornar slots disponíveis usando CTEs
  RETURN QUERY
  WITH 
  -- CTE 1: Buscar professores disponíveis da unidade
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      COALESCE(p.prioridade, 999) as prioridade
    FROM professores p
    WHERE p.status = true
      AND p.unit_id = p_unit_id
  ),
  
  -- CTE 2: Buscar salas disponíveis da unidade
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.active = true
      AND s.unit_id = p_unit_id
  ),
  
  -- CTE 3: Buscar agendamentos bloqueados (eventos de professor e sala)
  agendamentos_bloqueados AS (
    -- Eventos de professores
    SELECT 
      ep.professor_id,
      NULL::uuid as sala_id,
      ep.horario_inicio,
      ep.horario_fim
    FROM eventos_professor ep
    WHERE ep.data = p_data
      AND ep.active = true
    
    UNION ALL
    
    -- Eventos de salas
    SELECT 
      NULL::uuid as professor_id,
      es.sala_id,
      es.horario_inicio,
      es.horario_fim
    FROM eventos_sala es
    WHERE es.data = p_data
      AND es.active = true
  ),
  
  -- CTE 4: Gerar slots de 1 hora
  slots_horarios AS (
    SELECT 
      slot_time::TIME as slot_inicio,
      (slot_time + INTERVAL '1 hour')::TIME as slot_fim
    FROM generate_series(
      (p_data + v_horario_inicio)::TIMESTAMP,
      (p_data + v_horario_fim - INTERVAL '1 hour')::TIMESTAMP,
      INTERVAL '1 hour'
    ) AS slot_time
  )
  
  -- LOG: Combinar professores, salas e slots, verificando conflitos
  SELECT 
    sh.slot_inicio,
    sh.slot_fim,
    pd.id as professor_id,
    pd.nome as professor_nome,
    pd.prioridade,
    sd.id as sala_id,
    sd.nome as sala_nome
  FROM slots_horarios sh
  CROSS JOIN professores_disponiveis pd
  CROSS JOIN salas_disponiveis sd
  WHERE NOT EXISTS (
    -- Verificar se há conflito com eventos do professor
    SELECT 1 
    FROM agendamentos_bloqueados ab
    WHERE ab.professor_id = pd.id
      AND sh.slot_inicio < ab.horario_fim
      AND sh.slot_fim > ab.horario_inicio
  )
  AND NOT EXISTS (
    -- Verificar se há conflito com eventos da sala
    SELECT 1 
    FROM agendamentos_bloqueados ab
    WHERE ab.sala_id = sd.id
      AND sh.slot_inicio < ab.horario_fim
      AND sh.slot_fim > ab.horario_inicio
  )
  ORDER BY 
    pd.prioridade ASC,  -- Professores com menor prioridade primeiro
    sh.slot_inicio ASC; -- Horários mais cedo primeiro
    
  -- LOG: Função executada com sucesso
  RAISE NOTICE 'LOG: get_horarios_aula_inaugural - Execução concluída';
  
END;
$$;

-- LOG: Adicionar comentário descritivo na função
COMMENT ON FUNCTION get_horarios_aula_inaugural IS 
'Retorna slots de 1 hora disponíveis para aula inaugural.
Horários de funcionamento:
- Segunda a Sexta: 08:00 às 20:30
- Sábado: 08:00 às 13:00
- Domingo: sem atendimento

Verifica disponibilidade de professor e sala considerando:
- eventos_professor (bloqueios de professor)
- eventos_sala (bloqueios de sala)
- Filtra por unit_id
- Ordena por prioridade do professor e horário';