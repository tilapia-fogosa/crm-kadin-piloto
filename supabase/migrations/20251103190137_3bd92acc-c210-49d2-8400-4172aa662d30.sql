-- Migration: Corrigir função get_horarios_aula_inaugural
-- Corrige 4 problemas críticos identificados:
-- 1. prioridade_aula_inaugural → prioridade (coluna correta)
-- 2. Conversão de tipo dia_semana (INTEGER → TEXT)
-- 3. Disponibilidade opcional (se não houver cadastro, libera todos os horários)
-- 4. Tratamento de prioridade = NULL

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
) AS $$
DECLARE
  v_dia_semana INTEGER;
  v_dia_semana_text TEXT;
BEGIN
  -- LOG: Início da função
  RAISE NOTICE 'get_horarios_aula_inaugural - Data: %, Unit: %', p_data, p_unit_id;
  
  -- Obter dia da semana (0=domingo, 6=sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data)::INTEGER;
  
  -- CORREÇÃO 2: Converter INTEGER para TEXT
  v_dia_semana_text := CASE v_dia_semana
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END;
  
  RAISE NOTICE 'Dia da semana: % (INTEGER: %, TEXT: %)', to_char(p_data, 'Day'), v_dia_semana, v_dia_semana_text;
  
  -- Retornar slots vazios para domingo (não há horário comercial)
  IF v_dia_semana = 0 THEN
    RAISE NOTICE 'Domingo - sem horários disponíveis';
    RETURN;
  END IF;

  RETURN QUERY
  WITH 
  -- CTE 1: Gerar slots de 30min (corrigido com TIMESTAMP)
  slots_possiveis AS (
    SELECT 
      ts::TIME as inicio,
      (ts + INTERVAL '30 minutes')::TIME as fim
    FROM generate_series(
      (CURRENT_DATE + TIME '08:00')::TIMESTAMP,
      (CURRENT_DATE + CASE 
        WHEN v_dia_semana = 6 THEN TIME '11:30'
        ELSE TIME '19:30'
      END)::TIMESTAMP,
      INTERVAL '30 minutes'
    ) ts
  ),
  
  -- CTE 2: Professores livres
  professores_livres AS (
    SELECT DISTINCT
      p.id as professor_id,
      p.nome as professor_nome,
      COALESCE(p.prioridade, 999) as prioridade,
      sp.inicio,
      sp.fim
    FROM professores p
    CROSS JOIN slots_possiveis sp
    WHERE 
      -- Filtro 1: Professor ativo
      p.status = true
      
      -- Filtro 2: Professor da unidade correta
      AND p.unit_id = p_unit_id
      
      -- Filtro 3: Professor não está em turma neste horário
      AND NOT EXISTS (
        SELECT 1 FROM turmas t
        WHERE t.professor_id = p.id
          AND t.dia_semana::TEXT = v_dia_semana_text
          AND (
            (t.horario_inicio, t.horario_fim) OVERLAPS (sp.inicio, sp.fim)
          )
      )
      
      -- Filtro 4: Professor não tem evento neste horário
      AND NOT EXISTS (
        SELECT 1 FROM eventos_professor ep
        WHERE ep.professor_id = p.id
          AND ep.data = p_data
          AND (ep.horario_inicio, ep.horario_fim) OVERLAPS (sp.inicio, sp.fim)
      )
      
      -- CORREÇÃO 3: Filtro de disponibilidade OPCIONAL
      AND (
        -- Caso 1: Não há disponibilidades cadastradas para este professor
        NOT EXISTS (
          SELECT 1 FROM disponibilidade_professores dp
          WHERE dp.professor_id = p.id
        )
        -- Caso 2: Há disponibilidades E o horário está dentro delas
        OR EXISTS (
          SELECT 1 FROM disponibilidade_professores dp
          WHERE dp.professor_id = p.id
            AND dp.dia_semana = v_dia_semana_text
            AND (dp.horario_inicio, dp.horario_fim) OVERLAPS (sp.inicio, sp.fim)
        )
      )
  ),
  
  -- CTE 3: Salas livres
  salas_livres AS (
    SELECT DISTINCT
      s.id as sala_id,
      s.nome as sala_nome,
      sp.inicio,
      sp.fim
    FROM salas s
    CROSS JOIN slots_possiveis sp
    WHERE 
      -- Filtro 1: Sala da unidade correta
      s.unit_id = p_unit_id
      
      -- Filtro 2: Sala não está ocupada por turma
      AND NOT EXISTS (
        SELECT 1 FROM turmas t
        WHERE t.sala_id = s.id
          AND t.dia_semana::TEXT = v_dia_semana_text
          AND (t.horario_inicio, t.horario_fim) OVERLAPS (sp.inicio, sp.fim)
      )
  )
  
  -- JOIN: Combinar professores e salas disponíveis simultaneamente
  SELECT 
    pl.inicio as slot_inicio,
    pl.fim as slot_fim,
    pl.professor_id,
    pl.professor_nome,
    pl.prioridade,
    sl.sala_id,
    sl.sala_nome
  FROM professores_livres pl
  INNER JOIN salas_livres sl 
    ON pl.inicio = sl.inicio 
    AND pl.fim = sl.fim
  ORDER BY 
    pl.inicio,
    pl.prioridade,
    pl.professor_nome;
    
  RAISE NOTICE 'Função finalizada - Total de slots retornados: %', 
    (SELECT COUNT(*) FROM professores_livres pl INNER JOIN salas_livres sl ON pl.inicio = sl.inicio AND pl.fim = sl.fim);
    
END;
$$ LANGUAGE plpgsql;