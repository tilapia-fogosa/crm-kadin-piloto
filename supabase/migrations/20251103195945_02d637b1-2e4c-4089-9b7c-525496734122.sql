-- LOG: Criação da view horarios_ocupados (TIPOS CORRIGIDOS)
-- PROPÓSITO: Consolidar todos os horários que NÃO podem ser agendados
-- INCLUI: aulas regulares, bloqueios manuais e horários fora do expediente

CREATE OR REPLACE VIEW horarios_ocupados AS
-- LOG: 1. Turmas ativas (aulas regulares)
SELECT 
  t.dia_semana::text,
  NULL::date as data_especifica,
  t.horario_inicio,
  t.horario_fim,
  t.professor_id,
  t.sala_id,
  t.unit_id,
  'turma_regular'::text as tipo_ocupacao,
  t.nome::text as descricao
FROM turmas t
WHERE t.active = true

UNION ALL

-- LOG: 2. Bloqueios manuais da tabela schedule_occupations
SELECT 
  (CASE EXTRACT(DOW FROM so.start_datetime)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda'
    WHEN 2 THEN 'terca'
    WHEN 3 THEN 'quarta'
    WHEN 4 THEN 'quinta'
    WHEN 5 THEN 'sexta'
    WHEN 6 THEN 'sabado'
  END)::text as dia_semana,
  so.start_datetime::date as data_especifica,
  so.start_datetime::time as horario_inicio,
  (so.start_datetime + (so.duration_minutes || ' minutes')::interval)::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  so.unit_id,
  'bloqueio_manual'::text as tipo_ocupacao,
  so.title::text as descricao
FROM schedule_occupations so
WHERE so.active = true

UNION ALL

-- LOG: 3. Horários FORA do expediente (antes do início)
-- Segunda, Quinta, Sexta: antes das 08:00
SELECT 
  dia::text as dia_semana,
  NULL::date as data_especifica,
  '00:00:00'::time as horario_inicio,
  '08:00:00'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário antes do expediente'::text as descricao
FROM unnest(ARRAY['segunda', 'quinta', 'sexta']) as dia

UNION ALL

-- Terça, Quarta: antes das 08:00
SELECT 
  dia::text as dia_semana,
  NULL::date as data_especifica,
  '00:00:00'::time as horario_inicio,
  '08:00:00'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário antes do expediente'::text as descricao
FROM unnest(ARRAY['terca', 'quarta']) as dia

UNION ALL

-- Sábado: antes das 08:00
SELECT 
  'sabado'::text as dia_semana,
  NULL::date as data_especifica,
  '00:00:00'::time as horario_inicio,
  '08:00:00'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário antes do expediente'::text as descricao

UNION ALL

-- LOG: 4. Horários FORA do expediente (depois do expediente)
-- Segunda, Quinta, Sexta: depois das 18:00
SELECT 
  dia::text as dia_semana,
  NULL::date as data_especifica,
  '18:00:00'::time as horario_inicio,
  '23:59:59'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário após o expediente'::text as descricao
FROM unnest(ARRAY['segunda', 'quinta', 'sexta']) as dia

UNION ALL

-- Terça, Quarta: depois das 20:30
SELECT 
  dia::text as dia_semana,
  NULL::date as data_especifica,
  '20:30:00'::time as horario_inicio,
  '23:59:59'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário após o expediente'::text as descricao
FROM unnest(ARRAY['terca', 'quarta']) as dia

UNION ALL

-- Sábado: depois das 12:00
SELECT 
  'sabado'::text as dia_semana,
  NULL::date as data_especifica,
  '12:00:00'::time as horario_inicio,
  '23:59:59'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Horário após o expediente'::text as descricao

UNION ALL

-- LOG: 5. Domingo inteiro bloqueado
SELECT 
  'domingo'::text as dia_semana,
  NULL::date as data_especifica,
  '00:00:00'::time as horario_inicio,
  '23:59:59'::time as horario_fim,
  NULL::uuid as professor_id,
  NULL::uuid as sala_id,
  NULL::uuid as unit_id,
  'fora_expediente'::text as tipo_ocupacao,
  'Sem expediente aos domingos'::text as descricao;

-- LOG: Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_turmas_dia_horario 
  ON turmas(dia_semana, horario_inicio, horario_fim) 
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_schedule_occupations_datetime 
  ON schedule_occupations(start_datetime) 
  WHERE active = true;

-- LOG: Comentário na view
COMMENT ON VIEW horarios_ocupados IS 'View consolidada de todos os horários ocupados: aulas regulares, bloqueios manuais e horários fora do expediente';