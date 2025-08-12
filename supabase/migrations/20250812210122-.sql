-- 1) Update RPC to include author_name from profiles
CREATE OR REPLACE FUNCTION public.kanban_client_activities(p_client_id uuid, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT
        json_agg((to_jsonb(a) || jsonb_build_object('author_name', p.full_name)) ORDER BY a.created_at DESC)
    INTO
        result
    FROM
        client_activities a
        LEFT JOIN profiles p ON p.id = a.created_by
    WHERE
        a.client_id = p_client_id
        AND a.active = true
    LIMIT
        p_limit
    OFFSET
        p_offset;
        
    -- Retorna um array vazio se não houver resultados
    RETURN COALESCE(result, '[]'::JSON);
END;
$function$;

-- 2) Tighten RLS for client_activities: replace permissive SELECT policy with unit access policy
DO $$
BEGIN
  -- Drop existing permissive select policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'client_activities' 
      AND policyname = 'Permitir leitura de atividades'
  ) THEN
    EXECUTE 'DROP POLICY "Permitir leitura de atividades" ON public.client_activities';
  END IF;

  -- Create stricter select policy based on unit access, if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'client_activities' 
      AND policyname = 'Users with unit access can view activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Users with unit access can view activities" ON public.client_activities FOR SELECT USING (user_has_access_to_unit(unit_id))';
  END IF;
END$$;