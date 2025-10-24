-- =====================================================
-- LOG: Correção da lógica de cálculo de comissões
-- DESCRIÇÃO: Ajusta para calcular comissão APENAS quando
--            ambos pagamentos (matrícula E material) estiverem confirmados
-- =====================================================

-- =====================================================
-- ETAPA 1: Corrigir função calculate_monthly_commission
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_monthly_commission(
  p_unit_id UUID,
  p_consultant_id UUID,
  p_month TEXT,
  p_force_recalculate BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_calculation_id UUID;
  v_formula RECORD;
  v_sale RECORD;
  v_total_sales INTEGER := 0;
  v_total_commission NUMERIC := 0;
  v_sale_commission NUMERIC;
  v_existing_calculation RECORD;
BEGIN
  -- LOG: Iniciando cálculo de comissão
  RAISE NOTICE 'LOG: Calculando comissão para consultor % na unidade % no mês %', 
    p_consultant_id, p_unit_id, p_month;
  
  -- Verificar se já existe cálculo
  SELECT * INTO v_existing_calculation
  FROM public.commission_calculations
  WHERE unit_id = p_unit_id
    AND consultant_id = p_consultant_id
    AND month = p_month;
  
  -- Se existe e está consolidado, não permite recalcular
  IF v_existing_calculation.id IS NOT NULL AND v_existing_calculation.is_consolidated THEN
    IF NOT p_force_recalculate THEN
      RAISE EXCEPTION 'Comissão já consolidada. Use force_recalculate=true para recalcular.';
    END IF;
  END IF;
  
  -- Buscar fórmula ativa para o mês
  SELECT * INTO v_formula
  FROM public.commission_formulas
  WHERE unit_id = p_unit_id
    AND active = true
    AND valid_from::TEXT <= p_month
    AND (valid_until IS NULL OR valid_until::TEXT >= p_month)
  ORDER BY valid_from DESC
  LIMIT 1;
  
  IF v_formula.id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma fórmula ativa encontrada para o período';
  END IF;
  
  RAISE NOTICE 'LOG: Usando fórmula: % (ID: %)', v_formula.formula_name, v_formula.id;
  
  -- Se existe cálculo anterior, deletar detalhes antigos
  IF v_existing_calculation.id IS NOT NULL THEN
    DELETE FROM public.commission_sale_details
    WHERE calculation_id = v_existing_calculation.id;
    
    v_calculation_id := v_existing_calculation.id;
  ELSE
    -- Criar novo registro de cálculo
    INSERT INTO public.commission_calculations (
      unit_id,
      consultant_id,
      month,
      formula_id,
      total_sales,
      total_commission,
      is_consolidated,
      details
    ) VALUES (
      p_unit_id,
      p_consultant_id,
      p_month,
      v_formula.id,
      0,
      0,
      false,
      jsonb_build_object(
        'formula_name', v_formula.formula_name,
        'formula_expression', v_formula.formula_expression,
        'calculated_at', NOW()
      )
    ) RETURNING id INTO v_calculation_id;
  END IF;
  
  -- Processar vendas do mês (atividades tipo "Matrícula")
  FOR v_sale IN
    SELECT 
      apv.id,
      apv.client_name,
      apv.enrollment_amount,
      apv.material_amount,
      apv.monthly_fee_amount,
      apv.enrollment_payment_confirmed,
      apv.material_payment_confirmed,
      apv.created_at
    FROM public.atividade_pos_venda apv
    JOIN public.clients c ON apv.client_id = c.id
    WHERE c.unit_id = p_unit_id
      AND apv.created_by = p_consultant_id
      AND TO_CHAR(apv.created_at, 'YYYY-MM') = p_month
      AND apv.active = true
  LOOP
    -- LOG: Diagnóstico da venda
    RAISE NOTICE 'LOG: Venda % - Matrícula confirmada: %, Material confirmado: %, Calculando comissão: %',
      v_sale.client_name,
      v_sale.enrollment_payment_confirmed,
      v_sale.material_payment_confirmed,
      (v_sale.enrollment_payment_confirmed AND v_sale.material_payment_confirmed);
    
    -- CORREÇÃO: Calcular comissão APENAS se AMBOS pagamentos estiverem confirmados
    v_sale_commission := CASE
      WHEN v_sale.enrollment_payment_confirmed AND v_sale.material_payment_confirmed THEN
        public.evaluate_formula(
          v_formula.formula_expression,
          COALESCE(v_sale.enrollment_amount, 0),
          COALESCE(v_sale.material_amount, 0),
          COALESCE(v_sale.monthly_fee_amount, 0)
        )
      ELSE
        0  -- Comissão ZERO se algum pagamento não confirmado
    END;
    
    -- CORREÇÃO: Armazenar valores ORIGINAIS (não zerados) na tabela
    INSERT INTO public.commission_sale_details (
      calculation_id,
      activity_id,
      client_name,
      enrollment_amount,
      material_amount,
      monthly_fee_amount,
      sale_commission,
      sale_date
    ) VALUES (
      v_calculation_id,
      v_sale.id,
      v_sale.client_name,
      v_sale.enrollment_amount,
      v_sale.material_amount,
      v_sale.monthly_fee_amount,
      v_sale_commission,
      v_sale.created_at
    );
    
    -- CORREÇÃO: Sempre contar a venda no total (independente de comissão)
    v_total_sales := v_total_sales + 1;
    
    -- Somar comissão apenas se confirmada
    v_total_commission := v_total_commission + v_sale_commission;
    
    RAISE NOTICE 'LOG: Comissão da venda: R$ %', v_sale_commission;
  END LOOP;
  
  -- Atualizar totais do cálculo
  UPDATE public.commission_calculations
  SET 
    total_sales = v_total_sales,
    total_commission = v_total_commission,
    updated_at = NOW()
  WHERE id = v_calculation_id;
  
  RAISE NOTICE 'LOG: Cálculo finalizado - Total vendas: %, Total comissão: R$ %', 
    v_total_sales, v_total_commission;
  
  RETURN jsonb_build_object(
    'calculation_id', v_calculation_id,
    'month', p_month,
    'total_sales', v_total_sales,
    'total_commission', v_total_commission,
    'formula_name', v_formula.formula_name
  );
END;
$$;

-- =====================================================
-- ETAPA 2: Recriar função get_commission_summary
-- =====================================================
DROP FUNCTION IF EXISTS public.get_commission_summary(UUID, UUID, TEXT, TEXT);

CREATE FUNCTION public.get_commission_summary(
  p_unit_id UUID,
  p_consultant_id UUID DEFAULT NULL,
  p_start_month TEXT DEFAULT NULL,
  p_end_month TEXT DEFAULT NULL
)
RETURNS TABLE (
  calculation_id UUID,
  consultant_id UUID,
  consultant_name TEXT,
  month TEXT,
  formula_name TEXT,
  total_sales INTEGER,
  sales_confirmed INTEGER,
  sales_pending INTEGER,
  total_commission NUMERIC,
  is_consolidated BOOLEAN,
  consolidated_at TIMESTAMPTZ,
  consolidated_by UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'LOG: Buscando resumo de comissões para unidade %', p_unit_id;
  
  RETURN QUERY
  SELECT 
    cc.id as calculation_id,
    cc.consultant_id,
    COALESCE(p.full_name, 'Consultor removido') as consultant_name,
    cc.month,
    cf.formula_name,
    cc.total_sales,
    -- CORREÇÃO: Vendas com AMBOS pagamentos confirmados
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.commission_sale_details csd
      JOIN public.atividade_pos_venda apv ON csd.activity_id = apv.id
      WHERE csd.calculation_id = cc.id
        AND apv.enrollment_payment_confirmed = TRUE
        AND apv.material_payment_confirmed = TRUE
    ), 0) as sales_confirmed,
    -- CORREÇÃO: Vendas com PELO MENOS UM pagamento não confirmado
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.commission_sale_details csd
      JOIN public.atividade_pos_venda apv ON csd.activity_id = apv.id
      WHERE csd.calculation_id = cc.id
        AND (apv.enrollment_payment_confirmed = FALSE 
             OR apv.material_payment_confirmed = FALSE)
    ), 0) as sales_pending,
    cc.total_commission,
    cc.is_consolidated,
    cc.consolidated_at,
    cc.consolidated_by,
    cc.created_at
  FROM public.commission_calculations cc
  LEFT JOIN public.commission_formulas cf ON cc.formula_id = cf.id
  LEFT JOIN public.profiles p ON cc.consultant_id = p.id
  WHERE cc.unit_id = p_unit_id
    AND (p_consultant_id IS NULL OR cc.consultant_id = p_consultant_id)
    AND (p_start_month IS NULL OR cc.month >= p_start_month)
    AND (p_end_month IS NULL OR cc.month <= p_end_month)
  ORDER BY cc.month DESC, consultant_name ASC;
END;
$$;