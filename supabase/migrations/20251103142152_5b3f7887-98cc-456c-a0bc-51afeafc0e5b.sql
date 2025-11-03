-- LOG: Correção da função get_horarios_aula_inaugural com DROP antes de recriar
-- MOTIVO: Corrigir erro de tipo no generate_series e remover referência ao campo 'active' inexistente
-- ETAPAS:
--   1. DROP da função existente
--   2. Recriação com correções necessárias

-- ETAPA 1: Remover função existente
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- ETAPA 2: Recriar função corrigida
CREATE FUNCTION get_horarios_aula_inaugural(
  p_data DATE,
  p_unit_id UUID DEFAULT NULL
)
RETURNS TABLE (
  slot_inicio TIME,
  slot_fim TIME,
  professor_id UUID,
  professor_nome TEXT,
  sala_id UUID,
  sala_nome TEXT,
  prioridade INTEGER
) AS $$
DECLARE
  v_dia_semana INTEGER;
  v_horario_inicio TIME;
  v_horario_fim TIME;
BEGIN
  -- LOG: Determinando dia da semana (0=domingo, 6=sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  
  -- LOG: Definindo horários de funcionamento baseado no dia
  IF v_dia_semana = 0 THEN -- Domingo
    v_horario_inicio := '08:00'::TIME;
    v_horario_fim := '12:00'::TIME;
  ELSIF v_dia_semana = 6 THEN -- Sábado
    v_horario_inicio := '08:00'::TIME;
    v_horario_fim := '18:00'::TIME;
  ELSE -- Segunda a Sexta
    v_horario_inicio := '08:00'::TIME;
    v_horario_fim := '22:00'::TIME;
  END IF;

  -- LOG: Gerando slots de horários disponíveis com professores e salas
  RETURN QUERY
  WITH 
  -- CTE 1: Professores disponíveis (CORRIGIDO: removido p.active)
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      CASE 
        WHEN p.especialidade = 'robotica' THEN 1
        WHEN p.especialidade = 'programacao' THEN 2
        ELSE 3
      END as prioridade
    FROM professores p
    WHERE p.status = true -- CORREÇÃO: Removido AND p.active = true
  ),
  
  -- CTE 2: Salas disponíveis (todas as unidades)
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.ativo = true
  ),
  
  -- CTE 3: Slots de tempo (CORRIGIDO: usando TIMESTAMP no generate_series)
  time_slots AS (
    SELECT 
      gs::TIME AS slot_inicio
    FROM generate_series(
      ('2000-01-01 ' || v_horario_inicio)::TIMESTAMP,
      ('2000-01-01 ' || v_horario_fim - INTERVAL '1 hour')::TIMESTAMP,
      INTERVAL '30 minutes'
    ) AS gs
  ),
  
  -- CTE 4: Agendamentos que bloqueiam horários
  agendamentos_bloqueados AS (
    SELECT DISTINCT
      aa.professor_id,
      aa.sala_id,
      aa.horario_inicio,
      aa.horario_fim
    FROM agendamentos_aulas aa
    WHERE aa.data_aula = p_data
      AND aa.status IN ('confirmado', 'pendente')
  ),
  
  -- CTE 5: Combinação de slots com recursos (CORRIGIDO: cálculo simplificado de slot_fim)
  slots_com_recursos AS (
    SELECT 
      ts.slot_inicio,
      (ts.slot_inicio + INTERVAL '1 hour')::TIME AS slot_fim, -- CORREÇÃO: Simplificado
      pd.id as professor_id,
      pd.nome as professor_nome,
      sd.id as sala_id,
      sd.nome as sala_nome,
      pd.prioridade
    FROM time_slots ts
    CROSS JOIN professores_disponiveis pd
    CROSS JOIN salas_disponiveis sd
  )
  
  -- Query final: Retorna apenas slots sem conflitos
  SELECT 
    scr.slot_inicio,
    scr.slot_fim,
    scr.professor_id,
    scr.professor_nome,
    scr.sala_id,
    scr.sala_nome,
    scr.prioridade
  FROM slots_com_recursos scr
  WHERE NOT EXISTS (
    SELECT 1 
    FROM agendamentos_bloqueados ab
    WHERE (
      -- Verifica se o professor está ocupado
      (ab.professor_id = scr.professor_id AND
       ab.horario_inicio < scr.slot_fim AND
       ab.horario_fim > scr.slot_inicio)
      OR
      -- Verifica se a sala está ocupada
      (ab.sala_id = scr.sala_id AND
       ab.horario_inicio < scr.slot_fim AND
       ab.horario_fim > scr.slot_inicio)
    )
  )
  ORDER BY scr.slot_inicio, scr.prioridade, scr.professor_nome, scr.sala_nome;
  
END;
$$ LANGUAGE plpgsql;

-- LOG: Função get_horarios_aula_inaugural corrigida com sucesso
COMMENT ON FUNCTION get_horarios_aula_inaugural IS 'Retorna horários disponíveis para aula inaugural com professor e sala. Busca professores e salas de todas as unidades.';