-- =====================================================
-- LOG: RPC Function para categorizar ocupações com validação de permissões
-- DESCRIÇÃO: Retorna ocupações categorizadas (past, next7days, future)
-- SEGURANÇA: Valida acesso do usuário à unidade via unit_users
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_categorized_schedule_occupations(
  p_unit_id UUID
)
RETURNS TABLE(
  id UUID,
  unit_id UUID,
  title TEXT,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_has_access BOOLEAN;
  v_today TIMESTAMP WITH TIME ZONE;
  v_end_next_7_days TIMESTAMP WITH TIME ZONE;
BEGIN
  -- LOG: Verificando usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  RAISE NOTICE 'LOG: Buscando ocupações categorizadas para unidade % pelo usuário %', 
    p_unit_id, v_user_id;
  
  -- LOG: Validando permissão do usuário na unidade
  SELECT EXISTS (
    SELECT 1 
    FROM public.unit_users uu
    WHERE uu.unit_id = p_unit_id
      AND uu.user_id = v_user_id
      AND uu.active = true
  ) INTO v_has_access;
  
  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Usuário não tem acesso a esta unidade';
  END IF;
  
  RAISE NOTICE 'LOG: Permissão validada. Categorizando ocupações...';
  
  -- Calcular limites de datas para categorização
  v_today := DATE_TRUNC('day', NOW());
  v_end_next_7_days := v_today + INTERVAL '6 days 23 hours 59 minutes';
  
  RAISE NOTICE 'LOG: Hoje: %, Fim próximos 7 dias: %', v_today, v_end_next_7_days;
  
  -- Retornar ocupações ativas com categoria calculada
  RETURN QUERY
  SELECT 
    so.id,
    so.unit_id,
    so.title,
    so.description,
    so.start_datetime,
    so.duration_minutes,
    so.created_by,
    COALESCE(p.full_name, 'Usuário removido') as created_by_name,
    so.created_at,
    so.updated_at,
    CASE
      WHEN so.start_datetime < v_today THEN 'past'
      WHEN so.start_datetime >= v_today AND so.start_datetime <= v_end_next_7_days THEN 'next7days'
      ELSE 'future'
    END as category
  FROM public.schedule_occupations so
  LEFT JOIN public.profiles p ON so.created_by = p.id
  WHERE so.unit_id = p_unit_id
    AND so.active = true
  ORDER BY 
    CASE
      WHEN so.start_datetime >= v_today AND so.start_datetime <= v_end_next_7_days THEN 1
      WHEN so.start_datetime > v_end_next_7_days THEN 2
      ELSE 3
    END,
    so.start_datetime ASC;
  
  RAISE NOTICE 'LOG: Ocupações categorizadas retornadas com sucesso';
END;
$$;

-- LOG: Comentário na função para documentação
COMMENT ON FUNCTION public.get_categorized_schedule_occupations(UUID) IS 
'Retorna ocupações da agenda categorizadas por período temporal (past, next7days, future). 
Valida permissão do usuário na unidade através da tabela unit_users.
Categorias: past (antes de hoje), next7days (hoje até +6 dias), future (+7 dias ou mais).';

-- LOG: Criar índice composto para otimizar a query
CREATE INDEX IF NOT EXISTS idx_schedule_occupations_unit_datetime 
ON public.schedule_occupations(unit_id, start_datetime) 
WHERE active = true;

COMMENT ON INDEX idx_schedule_occupations_unit_datetime IS 
'Índice composto para otimizar busca de ocupações por unidade e ordenação temporal';