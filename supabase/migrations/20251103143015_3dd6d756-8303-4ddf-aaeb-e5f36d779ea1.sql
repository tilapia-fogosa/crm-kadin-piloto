-- LOG: Correção completa - RLS para salas + função get_horarios_aula_inaugural
-- MOTIVO: 
--   1. Tabela salas sem RLS impede acesso
--   2. Função usa colunas erradas: especialidade → prioridade, ativo → active
-- ETAPAS:
--   1. Criar RLS para tabela salas
--   2. Recriar função com colunas corretas

-- ETAPA 1: Habilitar RLS e criar políticas para tabela salas
-- LOG: Permitindo leitura de salas para usuários autenticados e público
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de salas para autenticados" ON salas
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permitir leitura de salas para público" ON salas
FOR SELECT TO public
USING (true);

-- ETAPA 2: Remover e recriar função com correções
-- LOG: Dropando função existente
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- LOG: Recriando função com correções:
--   - professores: usar p.prioridade (não p.especialidade)
--   - salas: usar s.active (não s.ativo)
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
  -- CTE 1: Professores disponíveis (CORRIGIDO: usando p.prioridade)
  professores_disponiveis AS (
    SELECT 
      p.id,
      p.nome,
      COALESCE(p.prioridade, 999) as prioridade
    FROM professores p
    WHERE p.status = true
  ),
  
  -- CTE 2: Salas disponíveis (CORRIGIDO: usando s.active)
  salas_disponiveis AS (
    SELECT 
      s.id,
      s.nome
    FROM salas s
    WHERE s.active = true
  ),
  
  -- CTE 3: Slots de tempo
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
  
  -- CTE 5: Combinação de slots com recursos
  slots_com_recursos AS (
    SELECT 
      ts.slot_inicio,
      (ts.slot_inicio + INTERVAL '1 hour')::TIME AS slot_fim,
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

-- LOG: Função corrigida e RLS aplicado com sucesso
COMMENT ON FUNCTION get_horarios_aula_inaugural IS 'Retorna horários disponíveis para aula inaugural com professor e sala. Usa prioridade dos professores e campo active das salas.';