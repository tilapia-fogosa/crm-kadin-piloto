-- LOG: Implementando foreign keys faltantes e função backend para pós-venda comercial
-- LOG: Etapa 1: Adicionar foreign keys para client_activity_id e created_by

-- Adicionar foreign key para client_activity_id
-- LOG: Criando relacionamento entre atividade_pos_venda.client_activity_id e client_activities.id
ALTER TABLE public.atividade_pos_venda 
ADD CONSTRAINT fk_atividade_pos_venda_client_activity_id 
FOREIGN KEY (client_activity_id) 
REFERENCES public.client_activities(id) 
ON DELETE CASCADE;

-- Adicionar foreign key para created_by
-- LOG: Criando relacionamento entre atividade_pos_venda.created_by e profiles.id
ALTER TABLE public.atividade_pos_venda 
ADD CONSTRAINT fk_atividade_pos_venda_created_by 
FOREIGN KEY (created_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- LOG: Etapa 2: Criar função backend otimizada para buscar atividades de pós-venda
-- LOG: Esta função centraliza toda a lógica de JOIN e filtros no backend
CREATE OR REPLACE FUNCTION public.get_pos_venda_activities(
  p_unit_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  client_id uuid,
  client_name text,
  client_activity_id uuid,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  active boolean,
  -- Campos do cliente/student
  full_name text,
  cpf text,
  rg text,
  birth_date date,
  address_postal_code text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  photo_url text,
  photo_thumbnail_url text,
  -- Informações da unidade
  unit_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Executando consulta otimizada de atividades de pós-venda
  -- LOG: Filtros aplicados: unidades especificadas ou todas as unidades do usuário
  
  RETURN QUERY
  SELECT 
    apv.id,
    apv.client_id,
    apv.client_name,
    apv.client_activity_id,
    apv.created_by,
    COALESCE(p.full_name, 'Usuário não identificado') as created_by_name,
    apv.created_at,
    apv.updated_at,
    apv.active,
    -- Campos do cliente/student
    apv.full_name,
    apv.cpf,
    apv.rg,
    apv.birth_date,
    apv.address_postal_code,
    apv.address_street,
    apv.address_number,
    apv.address_complement,
    apv.address_neighborhood,
    apv.address_city,
    apv.address_state,
    apv.photo_url,
    apv.photo_thumbnail_url,
    -- Informações da unidade através do cliente
    c.unit_id
  FROM public.atividade_pos_venda apv
  INNER JOIN public.clients c ON apv.client_id = c.id
  LEFT JOIN public.profiles p ON apv.created_by = p.id
  LEFT JOIN public.client_activities ca ON apv.client_activity_id = ca.id
  WHERE 
    apv.active = true
    AND c.active = true
    AND (
      p_unit_ids IS NULL 
      OR array_length(p_unit_ids, 1) IS NULL 
      OR c.unit_id = ANY(p_unit_ids)
    )
    -- Filtro de segurança: usuário deve ter acesso à unidade
    AND EXISTS (
      SELECT 1 
      FROM public.unit_users uu 
      WHERE uu.unit_id = c.unit_id 
        AND uu.user_id = auth.uid() 
        AND uu.active = true
    )
  ORDER BY apv.created_at DESC;
  
  -- LOG: Consulta executada com sucesso, dados retornados com JOINs otimizados
END;
$$;

-- LOG: Função get_pos_venda_activities criada com sucesso
-- LOG: Agora o frontend pode usar supabase.rpc() para consultas otimizadas
-- LOG: Toda lógica de JOIN e filtros centralizada no backend