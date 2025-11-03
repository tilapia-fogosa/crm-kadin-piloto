-- LOG: Atualizar view horarios_ocupados incluindo eventos_sala
-- Esta view consolida todos os horários ocupados de múltiplas fontes

-- Remover view existente
DROP VIEW IF EXISTS horarios_ocupados;

-- LOG: Criar view com 7 fontes de ocupação:
-- 1. Turmas regulares (aulas recorrentes)
-- 2. Aulas experimentais (data específica)
-- 3. Aulas inaugurais (data específica)
-- 4. Eventos de professor únicos (data específica)
-- 5. Eventos de professor recorrentes (semanal)
-- 6. Eventos de sala únicos (data específica) - NOVO
-- 7. Eventos de sala recorrentes (semanal) - NOVO
-- 8. Horários fora do expediente

CREATE VIEW horarios_ocupados AS

-- LOG: FONTE 1 - Turmas regulares ativas
SELECT 
  t.dia_semana::text as dia_semana,
  NULL::date as data_especifica,
  t.horario_inicio::time as horario_inicio,
  t.horario_fim::time as horario_fim,
  t.professor_id,
  t.sala_id,
  t.unit_id,
  'turma_regular'::text as tipo_ocupacao,
  t.nome as descricao,
  NULL::uuid as evento_id
FROM turmas t
WHERE t.active = true

UNION ALL

-- LOG: FONTE 2 - Aulas experimentais ativas
SELECT 
  CASE EXTRACT(DOW FROM ae.data_aula_experimental)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  ae.data_aula_experimental as data_especifica,
  t.horario_inicio::time as horario_inicio,
  t.horario_fim::time as horario_fim,
  t.professor_id,
  t.sala_id,
  ae.unit_id,
  'aula_experimental'::text as tipo_ocupacao,
  'Aula Experimental: ' || ae.cliente_nome as descricao,
  ae.id as evento_id
FROM aulas_experimentais ae
JOIN turmas t ON ae.turma_id = t.id
WHERE ae.active = true

UNION ALL

-- LOG: FONTE 3 - Aulas inaugurais ativas
SELECT 
  CASE EXTRACT(DOW FROM apv.data_aula_inaugural)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  apv.data_aula_inaugural as data_especifica,
  t.horario_inicio::time as horario_inicio,
  t.horario_fim::time as horario_fim,
  t.professor_id,
  t.sala_id,
  c.unit_id,
  'aula_inaugural'::text as tipo_ocupacao,
  'Aula Inaugural: ' || apv.full_name as descricao,
  apv.id as evento_id
FROM atividade_pos_venda apv
JOIN clients c ON apv.client_id = c.id
LEFT JOIN turmas t ON apv.turma_id = t.id
WHERE apv.data_aula_inaugural IS NOT NULL 
  AND apv.active = true
  AND t.id IS NOT NULL

UNION ALL

-- LOG: FONTE 4 - Eventos de professor ÚNICOS (não recorrentes)
SELECT 
  CASE EXTRACT(DOW FROM ep.data)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  ep.data as data_especifica,
  ep.horario_inicio::time as horario_inicio,
  ep.horario_fim::time as horario_fim,
  ep.professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'evento_professor'::text as tipo_ocupacao,
  ep.titulo as descricao,
  ep.id as evento_id
FROM eventos_professor ep
WHERE ep.active = true
  AND ep.recorrente = false
  AND ep.data IS NOT NULL

UNION ALL

-- LOG: FONTE 5 - Eventos de professor RECORRENTES (por dia da semana)
SELECT 
  ep.dia_semana::text as dia_semana,
  NULL::date as data_especifica,
  ep.horario_inicio::time as horario_inicio,
  ep.horario_fim::time as horario_fim,
  ep.professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'evento_professor_recorrente'::text as tipo_ocupacao,
  ep.titulo as descricao,
  ep.id as evento_id
FROM eventos_professor ep
WHERE ep.active = true
  AND ep.recorrente = true
  AND ep.tipo_recorrencia = 'semanal'
  AND ep.dia_semana IS NOT NULL

UNION ALL

-- LOG: FONTE 6 - Eventos de sala ÚNICOS (não recorrentes) - NOVO
SELECT 
  CASE EXTRACT(DOW FROM es.data)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  es.data as data_especifica,
  es.horario_inicio::time as horario_inicio,
  es.horario_fim::time as horario_fim,
  NULL::uuid as professor_id,
  es.sala_id,
  es.unit_id,
  'evento_sala'::text as tipo_ocupacao,
  es.titulo as descricao,
  es.id as evento_id
FROM eventos_sala es
WHERE es.active = true
  AND es.recorrente = false
  AND es.data IS NOT NULL

UNION ALL

-- LOG: FONTE 7 - Eventos de sala RECORRENTES (por dia da semana) - NOVO
SELECT 
  es.dia_semana::text as dia_semana,
  NULL::date as data_especifica,
  es.horario_inicio::time as horario_inicio,
  es.horario_fim::time as horario_fim,
  NULL::uuid as professor_id,
  es.sala_id,
  es.unit_id,
  'evento_sala_recorrente'::text as tipo_ocupacao,
  es.titulo as descricao,
  es.id as evento_id
FROM eventos_sala es
WHERE es.active = true
  AND es.recorrente = true
  AND es.tipo_recorrencia = 'semanal'
  AND es.dia_semana IS NOT NULL

UNION ALL

-- LOG: FONTE 8 - Horários fora do expediente
SELECT 
  dia::text as dia_semana,
  NULL::date as data_especifica,
  inicio::time as horario_inicio,
  fim::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Fora do horário de funcionamento' as descricao,
  NULL::uuid as evento_id
FROM (
  -- Segunda-feira: antes das 08:00 e depois das 18:00
  SELECT 'Segunda-feira' as dia, '00:00:00'::time as inicio, '08:00:00'::time as fim
  UNION ALL SELECT 'Segunda-feira', '18:00:00'::time, '23:59:59'::time
  
  -- Terça-feira: antes das 08:00 e depois das 20:30
  UNION ALL SELECT 'Terça-feira', '00:00:00'::time, '08:00:00'::time
  UNION ALL SELECT 'Terça-feira', '20:30:00'::time, '23:59:59'::time
  
  -- Quarta-feira: antes das 08:00 e depois das 20:30
  UNION ALL SELECT 'Quarta-feira', '00:00:00'::time, '08:00:00'::time
  UNION ALL SELECT 'Quarta-feira', '20:30:00'::time, '23:59:59'::time
  
  -- Quinta-feira: antes das 08:00 e depois das 18:00
  UNION ALL SELECT 'Quinta-feira', '00:00:00'::time, '08:00:00'::time
  UNION ALL SELECT 'Quinta-feira', '18:00:00'::time, '23:59:59'::time
  
  -- Sexta-feira: antes das 08:00 e depois das 18:00
  UNION ALL SELECT 'Sexta-feira', '00:00:00'::time, '08:00:00'::time
  UNION ALL SELECT 'Sexta-feira', '18:00:00'::time, '23:59:59'::time
  
  -- Sábado: antes das 08:00 e depois das 12:00
  UNION ALL SELECT 'Sábado', '00:00:00'::time, '08:00:00'::time
  UNION ALL SELECT 'Sábado', '12:00:00'::time, '23:59:59'::time
  
  -- Domingo: o dia inteiro
  UNION ALL SELECT 'Domingo', '00:00:00'::time, '23:59:59'::time
) horarios_bloqueados;

-- LOG: Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_turmas_active_unit ON turmas(active, unit_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_turmas_dia_semana ON turmas(dia_semana) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_aulas_experimentais_active ON aulas_experimentais(active, data_aula_experimental, turma_id) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_atividade_pos_venda_aula_inaugural ON atividade_pos_venda(data_aula_inaugural, turma_id, active) WHERE data_aula_inaugural IS NOT NULL AND active = true;

CREATE INDEX IF NOT EXISTS idx_eventos_professor_active ON eventos_professor(active, recorrente, data) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_eventos_professor_recorrente ON eventos_professor(active, recorrente, dia_semana) WHERE active = true AND recorrente = true;

CREATE INDEX IF NOT EXISTS idx_eventos_sala_active ON eventos_sala(active, recorrente, data) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_eventos_sala_recorrente ON eventos_sala(active, recorrente, dia_semana) WHERE active = true AND recorrente = true;

-- LOG: View criada com sucesso incluindo eventos de sala!