-- LOG: Correção completa da função get_horarios_aula_inaugural
-- Reverte para estrutura funcional e adiciona todas as correções necessárias

-- Drop da função atual
DROP FUNCTION IF EXISTS get_horarios_aula_inaugural(DATE, UUID);

-- Criação da função corrigida
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
  v_dia_semana INTEGER;
  v_dia_semana_text TEXT;
BEGIN
  -- LOG: Calcular dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);
  
  -- LOG: Converter para formato TEXT compatível com tabela turmas
  v_dia_semana_text := CASE v_dia_semana
    WHEN 0 THEN '0'
    WHEN 1 THEN '1'
    WHEN 2 THEN '2'
    WHEN 3 THEN '3'
    WHEN 4 THEN '4'
    WHEN 5 THEN '5'
    WHEN 6 THEN '6'
  END;

  RAISE NOTICE 'LOG: Buscando horários para data=%, unit_id=%, dia_semana=%', p_data, p_unit_id, v_dia_semana_text;

  -- LOG: Retornar horários com professores e salas livres
  RETURN QUERY
  WITH 
  -- CTE: Gerar slots de 30 minutos das 08:00 às 20:00
  time_slots AS (
    SELECT 
      gs::TIME as inicio,
      (gs + INTERVAL '30 minutes')::TIME as fim
    FROM generate_series(
      (p_data + TIME '08:00:00')::TIMESTAMP,
      (p_data + TIME '19:30:00')::TIMESTAMP,
      INTERVAL '30 minutes'
    ) gs
  ),
  
  -- CTE: Professores livres (sem turma no horário ou disponibilidade manual)
  professores_livres AS (
    SELECT DISTINCT
      p.id as professor_id,
      p.nome as professor_nome,
      COALESCE(p.prioridade, 999) as prioridade,
      ts.inicio,
      ts.fim
    FROM time_slots ts
    CROSS JOIN professores p
    WHERE p.unit_id = p_unit_id
      AND p.status = true  -- CORREÇÃO: usar p.status em vez de p.ativo
      AND NOT EXISTS (
        -- LOG: Verificar se professor tem turma no horário
        SELECT 1 FROM turmas t
        WHERE t.professor_id = p.id
          AND t.active = true
          AND t.dia_semana::TEXT = v_dia_semana_text
          AND t.horario_inicio IS NOT NULL  -- CORREÇÃO: garantir que horários existem
          AND t.horario_fim IS NOT NULL
          AND (
            (ts.inicio >= t.horario_inicio AND ts.inicio < t.horario_fim)
            OR (ts.fim > t.horario_inicio AND ts.fim <= t.horario_fim)
            OR (ts.inicio <= t.horario_inicio AND ts.fim >= t.horario_fim)
          )
      )
      -- LOG: Disponibilidade manual é OPCIONAL
      AND (
        NOT EXISTS (SELECT 1 FROM disponibilidade_professores WHERE professor_id = p.id)
        OR EXISTS (
          SELECT 1 FROM disponibilidade_professores dp
          WHERE dp.professor_id = p.id
            AND dp.dia_semana::TEXT = v_dia_semana_text
            AND ts.inicio >= dp.horario_inicio
            AND ts.fim <= dp.horario_fim
        )
      )
  ),
  
  -- CTE: Salas livres (sem turma no horário)
  salas_livres AS (
    SELECT DISTINCT
      sa.id as sala_id,
      sa.nome as sala_nome,
      ts.inicio,
      ts.fim
    FROM time_slots ts
    CROSS JOIN salas sa
    WHERE sa.unit_id = p_unit_id
      AND sa.active = true  -- CORREÇÃO: usar sa.active
      AND NOT EXISTS (
        -- LOG: Verificar se sala tem turma no horário
        SELECT 1 FROM turmas t
        WHERE t.sala_id = sa.id
          AND t.active = true
          AND t.dia_semana::TEXT = v_dia_semana_text
          AND t.horario_inicio IS NOT NULL  -- CORREÇÃO: garantir que horários existem
          AND t.horario_fim IS NOT NULL
          AND (
            (ts.inicio >= t.horario_inicio AND ts.inicio < t.horario_fim)
            OR (ts.fim > t.horario_inicio AND ts.fim <= t.horario_fim)
            OR (ts.inicio <= t.horario_inicio AND ts.fim >= t.horario_fim)
          )
      )
  )
  
  -- LOG: Combinar professores e salas disponíveis
  SELECT 
    pl.inicio::TEXT as slot_inicio,
    pl.fim::TEXT as slot_fim,
    pl.professor_id,
    pl.professor_nome,
    pl.prioridade,
    sl.sala_id,
    sl.sala_nome
  FROM professores_livres pl
  CROSS JOIN salas_livres sl
  WHERE pl.inicio = sl.inicio 
    AND pl.fim = sl.fim
  ORDER BY pl.prioridade, pl.inicio;

  RAISE NOTICE 'LOG: Função executada com sucesso';
END;
$$;