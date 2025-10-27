-- ============================================================================
-- FUNÇÃO RPC: check_schedule_occupation_conflict
-- DESCRIÇÃO: Valida conflitos de horário entre ocupações e agendamentos ativos
-- FONTE DA VERDADE: clients.scheduled_date (não client_activities)
-- AUTOR: Sistema de Agendamento
-- DATA: 2025-01-29
-- ============================================================================

CREATE OR REPLACE FUNCTION check_schedule_occupation_conflict(
  p_unit_id UUID,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_duration_minutes INTEGER,
  p_occupation_id UUID DEFAULT NULL
)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflict_type TEXT,
  conflicting_id UUID,
  conflicting_title TEXT,
  conflicting_start TIMESTAMP WITH TIME ZONE,
  conflicting_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_has_access BOOLEAN;
  v_end_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
  -- LOG: Etapa 1 - Validar autenticação
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  RAISE NOTICE 'check_schedule_occupation_conflict - Usuário autenticado: %', v_user_id;
  
  -- LOG: Etapa 2 - Validar permissão de acesso à unidade
  SELECT EXISTS (
    SELECT 1 FROM public.unit_users
    WHERE unit_id = p_unit_id
      AND user_id = v_user_id
      AND active = true
  ) INTO v_has_access;
  
  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Usuário não tem acesso à unidade %', p_unit_id;
  END IF;
  
  RAISE NOTICE 'check_schedule_occupation_conflict - Acesso à unidade validado';
  
  -- LOG: Etapa 3 - Calcular horário de término
  v_end_datetime := p_start_datetime + (p_duration_minutes || ' minutes')::INTERVAL;
  
  RAISE NOTICE 'check_schedule_occupation_conflict - Validando intervalo: % até % (% min)', 
    p_start_datetime, v_end_datetime, p_duration_minutes;
  
  -- ========================================================================
  -- PARTE 1: VERIFICAR CONFLITOS COM OUTRAS OCUPAÇÕES
  -- ========================================================================
  RETURN QUERY
  SELECT 
    true as has_conflict,
    'occupation'::TEXT as conflict_type,
    so.id as conflicting_id,
    so.title as conflicting_title,
    so.start_datetime as conflicting_start,
    (so.start_datetime + (so.duration_minutes || ' minutes')::INTERVAL) as conflicting_end
  FROM public.schedule_occupations so
  WHERE so.unit_id = p_unit_id
    AND so.active = true
    AND (p_occupation_id IS NULL OR so.id != p_occupation_id)
    AND (
      -- Caso 1: Nova ocupação começa durante ocupação existente
      (p_start_datetime >= so.start_datetime 
       AND p_start_datetime < (so.start_datetime + (so.duration_minutes || ' minutes')::INTERVAL))
      OR
      -- Caso 2: Nova ocupação termina durante ocupação existente
      (v_end_datetime > so.start_datetime 
       AND v_end_datetime <= (so.start_datetime + (so.duration_minutes || ' minutes')::INTERVAL))
      OR
      -- Caso 3: Nova ocupação engloba ocupação existente
      (p_start_datetime <= so.start_datetime 
       AND v_end_datetime >= (so.start_datetime + (so.duration_minutes || ' minutes')::INTERVAL))
    )
  LIMIT 1;
  
  -- ========================================================================
  -- PARTE 2: VERIFICAR CONFLITOS COM AGENDAMENTOS ATIVOS (clients.scheduled_date)
  -- FONTE DA VERDADE: Apenas clients.scheduled_date (não client_activities)
  -- ========================================================================
  IF NOT FOUND THEN
    RAISE NOTICE 'check_schedule_occupation_conflict - Sem conflito com ocupações, verificando agendamentos de clientes';
    
    RETURN QUERY
    SELECT 
      true as has_conflict,
      'client_appointment'::TEXT as conflict_type,
      c.id as conflicting_id,
      ('Agendamento: ' || c.name)::TEXT as conflicting_title,
      c.scheduled_date as conflicting_start,
      (c.scheduled_date + INTERVAL '60 minutes') as conflicting_end
    FROM public.clients c
    WHERE c.unit_id = p_unit_id
      AND c.active = true
      AND c.scheduled_date IS NOT NULL
      AND (
        -- Caso 1: Nova ocupação começa durante agendamento (sempre 60 min)
        (p_start_datetime >= c.scheduled_date 
         AND p_start_datetime < c.scheduled_date + INTERVAL '60 minutes')
        OR
        -- Caso 2: Nova ocupação termina durante agendamento
        (v_end_datetime > c.scheduled_date 
         AND v_end_datetime <= c.scheduled_date + INTERVAL '60 minutes')
        OR
        -- Caso 3: Nova ocupação engloba agendamento
        (p_start_datetime <= c.scheduled_date 
         AND v_end_datetime >= c.scheduled_date + INTERVAL '60 minutes')
      )
    LIMIT 1;
  END IF;
  
  -- LOG: Etapa 4 - Nenhum conflito encontrado
  IF NOT FOUND THEN
    RAISE NOTICE 'check_schedule_occupation_conflict - Horário está livre';
    
    RETURN QUERY
    SELECT 
      false as has_conflict,
      NULL::TEXT as conflict_type,
      NULL::UUID as conflicting_id,
      NULL::TEXT as conflicting_title,
      NULL::TIMESTAMP WITH TIME ZONE as conflicting_start,
      NULL::TIMESTAMP WITH TIME ZONE as conflicting_end;
  END IF;
  
  RAISE NOTICE 'check_schedule_occupation_conflict - Validação concluída';
END;
$$;

COMMENT ON FUNCTION check_schedule_occupation_conflict IS 
'Valida conflitos de horário entre ocupações propostas e:
1. Outras ocupações ativas (schedule_occupations)
2. Agendamentos ativos de clientes (clients.scheduled_date)
IMPORTANTE: Usa clients.scheduled_date como fonte da verdade (não client_activities)
Retorna detalhes do primeiro conflito encontrado ou indica disponibilidade.
Parâmetros:
- p_unit_id: ID da unidade
- p_start_datetime: Data/hora de início proposta
- p_duration_minutes: Duração em minutos
- p_occupation_id: ID da ocupação (opcional, para ignorar em edições)';