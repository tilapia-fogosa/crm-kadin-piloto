-- LOG: Atualizar RPC get_commission_summary para incluir contadores de vendas confirmadas e pendentes
-- DESCRIÇÃO: Adiciona sales_confirmed e sales_pending ao resumo de comissões

-- Primeiro remover a função existente
DROP FUNCTION IF EXISTS public.get_commission_summary(uuid, uuid, text, text);

-- Recriar com os novos campos
CREATE OR REPLACE FUNCTION public.get_commission_summary(
  p_unit_id uuid,
  p_consultant_id uuid DEFAULT NULL,
  p_start_month text DEFAULT NULL,
  p_end_month text DEFAULT NULL
)
RETURNS TABLE(
  calculation_id uuid,
  unit_id uuid,
  consultant_id uuid,
  consultant_name text,
  month text,
  total_sales integer,
  total_commission numeric,
  is_consolidated boolean,
  consolidated_at timestamp with time zone,
  formula_name text,
  created_at timestamp with time zone,
  sales_confirmed integer,
  sales_pending integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- LOG: Buscando resumo de comissões com contadores de vendas
  RAISE NOTICE 'LOG: Buscando comissões - unidade:%, consultor:%, período:% a %', 
    p_unit_id, p_consultant_id, p_start_month, p_end_month;
  
  RETURN QUERY
  SELECT 
    cc.id AS calculation_id,
    cc.unit_id,
    cc.consultant_id,
    COALESCE(p.full_name, 'Consultor removido') as consultant_name,
    cc.month,
    cc.total_sales,
    cc.total_commission,
    cc.is_consolidated,
    cc.consolidated_at,
    cf.formula_name,
    cc.created_at,
    -- Contar vendas com comissão > 0 (ambos pagamentos confirmados)
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.commission_sale_details csd
      WHERE csd.calculation_id = cc.id
      AND csd.sale_commission > 0
    ), 0) as sales_confirmed,
    -- Contar vendas com comissão = 0 (pelo menos um pagamento não confirmado)
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.commission_sale_details csd
      WHERE csd.calculation_id = cc.id
      AND csd.sale_commission = 0
    ), 0) as sales_pending
  FROM public.commission_calculations cc
  LEFT JOIN public.profiles p ON cc.consultant_id = p.id
  LEFT JOIN public.commission_formulas cf ON cc.formula_id = cf.id
  WHERE cc.unit_id = p_unit_id
  AND (p_consultant_id IS NULL OR cc.consultant_id = p_consultant_id)
  AND (p_start_month IS NULL OR cc.month >= p_start_month)
  AND (p_end_month IS NULL OR cc.month <= p_end_month)
  ORDER BY cc.month DESC, consultant_name ASC;
  
  RAISE NOTICE 'LOG: Resumo retornado com contadores de vendas';
END;
$function$;