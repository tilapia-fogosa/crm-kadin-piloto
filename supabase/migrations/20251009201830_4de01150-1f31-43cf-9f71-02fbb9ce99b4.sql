-- LOG: Criando função para avaliar expressões matemáticas dinamicamente
-- Esta função substitui variáveis pelos valores e avalia a expressão

CREATE OR REPLACE FUNCTION public.evaluate_formula(
  p_formula TEXT,
  p_matricula NUMERIC,
  p_material NUMERIC,
  p_mensalidade NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_formula_evaluated TEXT;
  v_result NUMERIC;
BEGIN
  -- LOG: Avaliando fórmula com valores fornecidos
  RAISE NOTICE 'LOG: Fórmula original: %', p_formula;
  RAISE NOTICE 'LOG: Valores - Matricula: %, Material: %, Mensalidade: %', p_matricula, p_material, p_mensalidade;
  
  -- Substituir variáveis pelos valores
  v_formula_evaluated := p_formula;
  v_formula_evaluated := REPLACE(v_formula_evaluated, 'Matricula', COALESCE(p_matricula, 0)::TEXT);
  v_formula_evaluated := REPLACE(v_formula_evaluated, 'Material', COALESCE(p_material, 0)::TEXT);
  v_formula_evaluated := REPLACE(v_formula_evaluated, 'Mensalidade', COALESCE(p_mensalidade, 0)::TEXT);
  
  RAISE NOTICE 'LOG: Fórmula após substituição: %', v_formula_evaluated;
  
  -- Avaliar expressão matemática
  EXECUTE 'SELECT ' || v_formula_evaluated INTO v_result;
  
  RAISE NOTICE 'LOG: Resultado da avaliação: %', v_result;
  
  RETURN COALESCE(v_result, 0);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao avaliar fórmula "%": %', p_formula, SQLERRM;
END;
$$;

-- LOG: Atualizando função calculate_monthly_commission para usar fórmula dinâmica
CREATE OR REPLACE FUNCTION public.calculate_monthly_commission(
  p_unit_id uuid, 
  p_consultant_id uuid, 
  p_month text, 
  p_force_recalculate boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_calculation_id UUID;
  v_formula RECORD;
  v_is_consolidated BOOLEAN;
  v_total_sales INTEGER := 0;
  v_total_commission NUMERIC := 0;
  v_sale RECORD;
  v_result JSONB;
BEGIN
  -- LOG: Iniciando cálculo de comissão
  RAISE NOTICE 'LOG: Calculando comissão - unidade:%, consultor:%, mês:%', p_unit_id, p_consultant_id, p_month;
  
  -- Verificar se já existe cálculo consolidado
  SELECT id, is_consolidated INTO v_calculation_id, v_is_consolidated
  FROM public.commission_calculations
  WHERE unit_id = p_unit_id
  AND consultant_id = p_consultant_id
  AND month = p_month;
  
  -- Se consolidado e não forçar recálculo, retornar erro
  IF v_is_consolidated AND NOT p_force_recalculate THEN
    RAISE EXCEPTION 'Cálculo já consolidado. Use p_force_recalculate = true para reconsolidar.';
  END IF;
  
  -- Buscar fórmula ativa da unidade para o período
  SELECT * INTO v_formula
  FROM public.commission_formulas
  WHERE unit_id = p_unit_id
  AND active = true
  AND valid_from <= (p_month || '-01')::DATE
  AND (valid_until IS NULL OR valid_until >= (p_month || '-01')::DATE)
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_formula IS NULL THEN
    RAISE EXCEPTION 'Nenhuma fórmula ativa encontrada para a unidade no período especificado';
  END IF;
  
  RAISE NOTICE 'LOG: Fórmula encontrada: % (id: %, expressão: %)', v_formula.formula_name, v_formula.id, v_formula.formula_expression;
  
  -- Deletar detalhes anteriores se estiver recalculando
  IF v_calculation_id IS NOT NULL THEN
    DELETE FROM public.commission_sale_details WHERE calculation_id = v_calculation_id;
  END IF;
  
  -- Criar ou atualizar registro de cálculo
  INSERT INTO public.commission_calculations (
    unit_id, consultant_id, month, formula_id, is_consolidated
  ) VALUES (
    p_unit_id, p_consultant_id, p_month, v_formula.id, false
  )
  ON CONFLICT (unit_id, consultant_id, month)
  DO UPDATE SET 
    formula_id = v_formula.id,
    is_consolidated = false,
    consolidated_at = NULL,
    consolidated_by = NULL,
    updated_at = NOW()
  RETURNING id INTO v_calculation_id;
  
  -- Buscar vendas do consultor no mês (apenas com confirmações necessárias)
  FOR v_sale IN
    SELECT 
      apv.id,
      apv.client_name,
      apv.enrollment_amount,
      apv.enrollment_payment_confirmed,
      apv.material_amount,
      apv.material_payment_confirmed,
      apv.monthly_fee_amount,
      apv.created_at
    FROM public.atividade_pos_venda apv
    JOIN public.clients c ON apv.client_id = c.id
    WHERE apv.created_by = p_consultant_id
    AND c.unit_id = p_unit_id
    AND TO_CHAR(apv.created_at, 'YYYY-MM') = p_month
    AND apv.active = true
  LOOP
    -- Calcular valores confirmados
    DECLARE
      v_matricula NUMERIC := CASE 
        WHEN v_sale.enrollment_payment_confirmed THEN COALESCE(v_sale.enrollment_amount, 0)
        ELSE 0
      END;
      v_material NUMERIC := CASE 
        WHEN v_sale.material_payment_confirmed THEN COALESCE(v_sale.material_amount, 0)
        ELSE 0
      END;
      v_mensalidade NUMERIC := COALESCE(v_sale.monthly_fee_amount, 0); -- Não requer confirmação
      v_sale_commission NUMERIC;
    BEGIN
      -- LOG: Processando venda
      RAISE NOTICE 'LOG: Processando venda - Cliente: %, Matrícula: % (confirmada: %), Material: % (confirmado: %), Mensalidade: %',
        v_sale.client_name, v_matricula, v_sale.enrollment_payment_confirmed, v_material, v_sale.material_payment_confirmed, v_mensalidade;
      
      -- Usar função de avaliação dinâmica de fórmula
      v_sale_commission := public.evaluate_formula(
        v_formula.formula_expression,
        v_matricula,
        v_material,
        v_mensalidade
      );
      
      RAISE NOTICE 'LOG: Comissão calculada para venda: %', v_sale_commission;
      
      -- Inserir detalhe da venda
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
        v_matricula,
        v_material,
        v_mensalidade,
        v_sale_commission,
        v_sale.created_at
      );
      
      v_total_sales := v_total_sales + 1;
      v_total_commission := v_total_commission + v_sale_commission;
    END;
  END LOOP;
  
  -- Atualizar totais no cálculo
  UPDATE public.commission_calculations
  SET 
    total_sales = v_total_sales,
    total_commission = v_total_commission,
    details = jsonb_build_object(
      'formula_name', v_formula.formula_name,
      'formula_expression', v_formula.formula_expression,
      'calculated_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = v_calculation_id;
  
  -- Retornar resultado
  v_result := jsonb_build_object(
    'calculation_id', v_calculation_id,
    'month', p_month,
    'total_sales', v_total_sales,
    'total_commission', v_total_commission,
    'formula_name', v_formula.formula_name
  );
  
  RAISE NOTICE 'LOG: Cálculo concluído - % vendas, R$ %', v_total_sales, v_total_commission;
  RETURN v_result;
END;
$function$;