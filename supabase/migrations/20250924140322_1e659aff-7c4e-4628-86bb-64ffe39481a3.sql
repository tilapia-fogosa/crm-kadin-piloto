-- LOG: Corrigindo funções - primeiro DROP e depois recriação
DROP FUNCTION IF EXISTS get_pos_venda_activities(uuid[]);

-- LOG: Recriando função get_pos_venda_activities para buscar vendedor real
CREATE OR REPLACE FUNCTION get_pos_venda_activities(p_unit_ids uuid[])
RETURNS TABLE(
  id uuid,
  client_id uuid,
  client_activity_id uuid,
  client_name text,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  active boolean,
  unit_id uuid,
  -- Campos do student/cliente
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
  photo_thumbnail_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Buscando atividades pós-venda com vendedor real da tabela sales
  RAISE NOTICE 'LOG: Buscando atividades pós-venda para unidades %', p_unit_ids;
  
  RETURN QUERY
  SELECT 
    apv.id,
    apv.client_id,
    apv.client_activity_id,
    apv.client_name,
    apv.created_by,
    -- Buscar nome real do vendedor que criou a matrícula
    COALESCE(
      -- Primeiro tentar buscar da tabela sales (vendedor que fez a venda/matrícula)
      (SELECT p_sales.full_name 
       FROM sales s 
       JOIN profiles p_sales ON s.created_by = p_sales.id 
       WHERE s.client_id = apv.client_id 
       ORDER BY s.created_at DESC 
       LIMIT 1),
      -- Se não encontrar, buscar do perfil do usuário que criou a atividade
      (SELECT p_activity.full_name 
       FROM profiles p_activity 
       WHERE p_activity.id = apv.created_by),
      -- Fallback
      'Vendedor não identificado'
    ) as created_by_name,
    apv.created_at,
    apv.updated_at,
    apv.active,
    -- Buscar unit_id do cliente
    c.unit_id,
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
    apv.photo_thumbnail_url
  FROM atividade_pos_venda apv
  JOIN clients c ON apv.client_id = c.id
  WHERE c.unit_id = ANY(p_unit_ids)
    AND apv.active = true
    AND c.active = true
  ORDER BY apv.created_at DESC;
  
  RAISE NOTICE 'LOG: Atividades pós-venda retornadas com sucesso';
END;
$$;