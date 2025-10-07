-- LOG: Criação do sistema de comissões pós-venda comercial
-- TABELAS: commission_formulas, commission_calculations, commission_sale_details
-- FUNÇÕES RPC: calculate_monthly_commission, consolidate_monthly_commission, get_commission_summary

-- ============================================================================
-- TABELA 1: commission_formulas (Fórmulas de comissão por unidade)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.commission_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  formula_name TEXT NOT NULL,
  formula_expression TEXT NOT NULL, -- Ex: "(Matricula * 0.1) + (Material * 0.05)"
  variables_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Configuração das variáveis
  active BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE, -- Null = sem data de término
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_commission_formulas_unit_active 
  ON public.commission_formulas(unit_id, active);
CREATE INDEX IF NOT EXISTS idx_commission_formulas_valid_period 
  ON public.commission_formulas(valid_from, valid_until);

-- LOG: Tabela commission_formulas criada

-- ============================================================================
-- TABELA 2: commission_calculations (Consolidações mensais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.commission_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Formato "YYYY-MM"
  formula_id UUID REFERENCES public.commission_formulas(id) ON DELETE SET NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_commission NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_consolidated BOOLEAN NOT NULL DEFAULT false,
  consolidated_at TIMESTAMP WITH TIME ZONE,
  consolidated_by UUID REFERENCES auth.users(id),
  details JSONB NOT NULL DEFAULT '{}'::jsonb, -- Dados detalhados do cálculo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(unit_id, consultant_id, month)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_commission_calculations_unit_month 
  ON public.commission_calculations(unit_id, month);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_consultant 
  ON public.commission_calculations(consultant_id, month);
CREATE INDEX IF NOT EXISTS idx_commission_calculations_consolidated 
  ON public.commission_calculations(is_consolidated);

-- LOG: Tabela commission_calculations criada

-- ============================================================================
-- TABELA 3: commission_sale_details (Detalhamento venda a venda)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.commission_sale_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL REFERENCES public.commission_calculations(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.atividade_pos_venda(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  enrollment_amount NUMERIC(10, 2),
  material_amount NUMERIC(10, 2),
  monthly_fee_amount NUMERIC(10, 2),
  sale_commission NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_commission_sale_details_calculation 
  ON public.commission_sale_details(calculation_id);
CREATE INDEX IF NOT EXISTS idx_commission_sale_details_activity 
  ON public.commission_sale_details(activity_id);

-- LOG: Tabela commission_sale_details criada

-- ============================================================================
-- RLS POLÍTICAS: commission_formulas
-- ============================================================================
ALTER TABLE public.commission_formulas ENABLE ROW LEVEL SECURITY;

-- SELECT: Apenas usuários da unidade
CREATE POLICY "Users can view formulas from their units"
ON public.commission_formulas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = commission_formulas.unit_id 
    AND user_id = auth.uid()
    AND active = true
  )
);

-- INSERT: Apenas franqueado ou admin
CREATE POLICY "Only franchisees and admins can create formulas"
ON public.commission_formulas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = commission_formulas.unit_id 
    AND user_id = auth.uid()
    AND role IN ('franqueado', 'admin')
    AND active = true
  )
);

-- UPDATE: Apenas franqueado ou admin
CREATE POLICY "Only franchisees and admins can update formulas"
ON public.commission_formulas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = commission_formulas.unit_id 
    AND user_id = auth.uid()
    AND role IN ('franqueado', 'admin')
    AND active = true
  )
);

-- DELETE: Apenas franqueado ou admin
CREATE POLICY "Only franchisees and admins can delete formulas"
ON public.commission_formulas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = commission_formulas.unit_id 
    AND user_id = auth.uid()
    AND role IN ('franqueado', 'admin')
    AND active = true
  )
);

-- LOG: Políticas RLS para commission_formulas criadas

-- ============================================================================
-- RLS POLÍTICAS: commission_calculations
-- ============================================================================
ALTER TABLE public.commission_calculations ENABLE ROW LEVEL SECURITY;

-- SELECT: Consultores veem apenas suas, Franqueados/Admins veem todas da unidade
CREATE POLICY "Consultants see only their commissions"
ON public.commission_calculations FOR SELECT
USING (
  consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = commission_calculations.unit_id 
    AND user_id = auth.uid()
    AND role IN ('franqueado', 'admin')
    AND active = true
  )
);

-- INSERT/UPDATE/DELETE: Sistema gerencia automaticamente via RPC
CREATE POLICY "System can manage calculations"
ON public.commission_calculations FOR ALL
USING (true)
WITH CHECK (true);

-- LOG: Políticas RLS para commission_calculations criadas

-- ============================================================================
-- RLS POLÍTICAS: commission_sale_details
-- ============================================================================
ALTER TABLE public.commission_sale_details ENABLE ROW LEVEL SECURITY;

-- SELECT: Baseado na calculation_id (herda permissões de commission_calculations)
CREATE POLICY "Users can view sale details from their calculations"
ON public.commission_sale_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.commission_calculations cc
    WHERE cc.id = commission_sale_details.calculation_id
    AND (
      cc.consultant_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.unit_users 
        WHERE unit_id = cc.unit_id 
        AND user_id = auth.uid()
        AND role IN ('franqueado', 'admin')
        AND active = true
      )
    )
  )
);

-- INSERT/UPDATE/DELETE: Sistema gerencia automaticamente via RPC
CREATE POLICY "System can manage sale details"
ON public.commission_sale_details FOR ALL
USING (true)
WITH CHECK (true);

-- LOG: Políticas RLS para commission_sale_details criadas

-- ============================================================================
-- FUNÇÃO RPC 1: calculate_monthly_commission
-- Calcula comissão de um consultor em um mês específico
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_monthly_commission(
  p_unit_id UUID,
  p_consultant_id UUID,
  p_month TEXT, -- Formato "YYYY-MM"
  p_force_recalculate BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_calculation_id UUID;
  v_formula RECORD;
  v_is_consolidated BOOLEAN;
  v_total_sales INTEGER := 0;
  v_total_commission NUMERIC := 0;
  v_sale RECORD;
  v_variables JSONB;
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
  
  RAISE NOTICE 'LOG: Fórmula encontrada: % (id: %)', v_formula.formula_name, v_formula.id;
  
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
    -- Calcular comissão desta venda (placeholder - será implementado com avaliador de expressões)
    -- Por enquanto, usar fórmula simples: (Matricula * 0.1) + (Material * 0.05) + (Mensalidade * 0.05)
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
      -- NOTA: Aqui será integrado o avaliador de expressões (mathjs ou expr-eval)
      -- Por enquanto, fórmula simples de exemplo
      v_sale_commission := (v_matricula * 0.1) + (v_material * 0.05) + (v_mensalidade * 0.05);
      
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
$$;

-- LOG: Função calculate_monthly_commission criada

-- ============================================================================
-- FUNÇÃO RPC 2: consolidate_monthly_commission
-- Marca um cálculo como consolidado (impede recálculos automáticos)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.consolidate_monthly_commission(
  p_calculation_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unit_id UUID;
  v_user_can_consolidate BOOLEAN;
BEGIN
  -- LOG: Iniciando consolidação
  RAISE NOTICE 'LOG: Consolidando cálculo %', p_calculation_id;
  
  -- Buscar unit_id do cálculo
  SELECT unit_id INTO v_unit_id
  FROM public.commission_calculations
  WHERE id = p_calculation_id;
  
  IF v_unit_id IS NULL THEN
    RAISE EXCEPTION 'Cálculo não encontrado';
  END IF;
  
  -- Verificar permissão (apenas franqueado ou admin)
  SELECT EXISTS (
    SELECT 1 FROM public.unit_users 
    WHERE unit_id = v_unit_id 
    AND user_id = auth.uid()
    AND role IN ('franqueado', 'admin')
    AND active = true
  ) INTO v_user_can_consolidate;
  
  IF NOT v_user_can_consolidate THEN
    RAISE EXCEPTION 'Apenas franqueados ou administradores podem consolidar comissões';
  END IF;
  
  -- Consolidar
  UPDATE public.commission_calculations
  SET 
    is_consolidated = true,
    consolidated_at = NOW(),
    consolidated_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_calculation_id;
  
  RAISE NOTICE 'LOG: Cálculo consolidado com sucesso';
  RETURN true;
END;
$$;

-- LOG: Função consolidate_monthly_commission criada

-- ============================================================================
-- FUNÇÃO RPC 3: get_commission_summary
-- Retorna resumo de comissões com filtros
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_commission_summary(
  p_unit_id UUID,
  p_consultant_id UUID DEFAULT NULL,
  p_start_month TEXT DEFAULT NULL,
  p_end_month TEXT DEFAULT NULL
)
RETURNS TABLE (
  calculation_id UUID,
  unit_id UUID,
  consultant_id UUID,
  consultant_name TEXT,
  month TEXT,
  total_sales INTEGER,
  total_commission NUMERIC,
  is_consolidated BOOLEAN,
  consolidated_at TIMESTAMP WITH TIME ZONE,
  formula_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- LOG: Buscando resumo de comissões
  RAISE NOTICE 'LOG: Buscando comissões - unidade:%, consultor:%, período:% a %', 
    p_unit_id, p_consultant_id, p_start_month, p_end_month;
  
  RETURN QUERY
  SELECT 
    cc.id,
    cc.unit_id,
    cc.consultant_id,
    COALESCE(p.full_name, 'Consultor removido') as consultant_name,
    cc.month,
    cc.total_sales,
    cc.total_commission,
    cc.is_consolidated,
    cc.consolidated_at,
    cf.formula_name,
    cc.created_at
  FROM public.commission_calculations cc
  LEFT JOIN public.profiles p ON cc.consultant_id = p.id
  LEFT JOIN public.commission_formulas cf ON cc.formula_id = cf.id
  WHERE cc.unit_id = p_unit_id
  AND (p_consultant_id IS NULL OR cc.consultant_id = p_consultant_id)
  AND (p_start_month IS NULL OR cc.month >= p_start_month)
  AND (p_end_month IS NULL OR cc.month <= p_end_month)
  ORDER BY cc.month DESC, consultant_name ASC;
  
  RAISE NOTICE 'LOG: Resumo retornado com sucesso';
END;
$$;

-- LOG: Função get_commission_summary criada

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_commission_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_commission_formulas_updated_at
BEFORE UPDATE ON public.commission_formulas
FOR EACH ROW
EXECUTE FUNCTION public.update_commission_updated_at();

CREATE TRIGGER update_commission_calculations_updated_at
BEFORE UPDATE ON public.commission_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_commission_updated_at();

-- LOG: Sistema de comissões criado com sucesso
-- PRÓXIMO PASSO: Implementar avaliador de expressões matemáticas na aplicação