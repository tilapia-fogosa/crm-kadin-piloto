-- LOG: Correção para usar ENUM kit_type ao invés da tabela kit_types
-- Removendo tabela kit_types e criando ENUM para kit types

-- 1. Drop da tabela kit_types (que foi criada incorretamente)
DROP TABLE IF EXISTS kit_types CASCADE;

-- 2. Criar ENUM para kit_type
CREATE TYPE kit_type AS ENUM (
  'kit_1',
  'kit_2', 
  'kit_3',
  'kit_4',
  'kit_5',
  'kit_6',
  'kit_7',
  'kit_8'
);

-- 3. Alterar tabela atividade_pos_venda para usar ENUM ao invés de UUID
-- Primeiro remover a coluna kit_type_id
ALTER TABLE atividade_pos_venda DROP COLUMN IF EXISTS kit_type_id;

-- Adicionar nova coluna kit_type como ENUM
ALTER TABLE atividade_pos_venda ADD COLUMN kit_type kit_type;

-- 4. Atualizar função get_pos_venda_commercial_data para remover JOIN com kit_types
CREATE OR REPLACE FUNCTION get_pos_venda_commercial_data(p_activity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- LOG: Buscando dados comerciais com ENUM kit_type
  RAISE NOTICE 'LOG: Buscando dados comerciais para atividade %', p_activity_id;
  
  SELECT 
    jsonb_build_object(
      'kit_type', apv.kit_type,
      'enrollment_amount', apv.enrollment_amount,
      'enrollment_payment_date', apv.enrollment_payment_date,
      'enrollment_payment_method', apv.enrollment_payment_method,
      'enrollment_installments', apv.enrollment_installments,
      'monthly_fee_amount', apv.monthly_fee_amount,
      'first_monthly_fee_date', apv.first_monthly_fee_date,
      'monthly_fee_payment_method', apv.monthly_fee_payment_method,
      'material_amount', apv.material_amount,
      'material_payment_date', apv.material_payment_date,
      'material_payment_method', apv.material_payment_method,
      'material_installments', apv.material_installments,
      'commercial_observations', apv.commercial_observations
    ) INTO v_result
  FROM atividade_pos_venda apv
  WHERE apv.id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados comerciais encontrados: %', COALESCE(v_result::text, 'NULL');
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 5. Atualizar função save_pos_venda_commercial_data para usar ENUM
CREATE OR REPLACE FUNCTION save_pos_venda_commercial_data(
  p_activity_id uuid,
  p_kit_type kit_type DEFAULT NULL,
  p_enrollment_amount numeric DEFAULT NULL,
  p_enrollment_payment_date date DEFAULT NULL,
  p_enrollment_payment_method payment_method DEFAULT NULL,
  p_enrollment_installments integer DEFAULT NULL,
  p_monthly_fee_amount numeric DEFAULT NULL,
  p_first_monthly_fee_date date DEFAULT NULL,
  p_monthly_fee_payment_method payment_method DEFAULT NULL,
  p_material_amount numeric DEFAULT NULL,
  p_material_payment_date date DEFAULT NULL,
  p_material_payment_method payment_method DEFAULT NULL,
  p_material_installments integer DEFAULT NULL,
  p_commercial_observations text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- LOG: Salvando dados comerciais com ENUM kit_type
  RAISE NOTICE 'LOG: Salvando dados comerciais para atividade %, kit_type: %', p_activity_id, p_kit_type;
  
  -- Verificar se atividade existe
  IF NOT EXISTS (SELECT 1 FROM atividade_pos_venda WHERE id = p_activity_id) THEN
    RAISE EXCEPTION 'Atividade pós-venda não encontrada';
  END IF;
  
  -- Atualizar dados comerciais
  UPDATE atividade_pos_venda
  SET 
    kit_type = COALESCE(p_kit_type, kit_type),
    enrollment_amount = COALESCE(p_enrollment_amount, enrollment_amount),
    enrollment_payment_date = COALESCE(p_enrollment_payment_date, enrollment_payment_date),
    enrollment_payment_method = COALESCE(p_enrollment_payment_method, enrollment_payment_method),
    enrollment_installments = COALESCE(p_enrollment_installments, enrollment_installments),
    monthly_fee_amount = COALESCE(p_monthly_fee_amount, monthly_fee_amount),
    first_monthly_fee_date = COALESCE(p_first_monthly_fee_date, first_monthly_fee_date),
    monthly_fee_payment_method = COALESCE(p_monthly_fee_payment_method, monthly_fee_payment_method),
    material_amount = COALESCE(p_material_amount, material_amount),
    material_payment_date = COALESCE(p_material_payment_date, material_payment_date),
    material_payment_method = COALESCE(p_material_payment_method, material_payment_method),
    material_installments = COALESCE(p_material_installments, material_installments),
    commercial_observations = COALESCE(p_commercial_observations, commercial_observations),
    updated_at = NOW()
  WHERE id = p_activity_id
  RETURNING 
    jsonb_build_object(
      'id', id,
      'kit_type', kit_type,
      'enrollment_amount', enrollment_amount,
      'enrollment_payment_date', enrollment_payment_date,
      'enrollment_payment_method', enrollment_payment_method,
      'enrollment_installments', enrollment_installments,
      'monthly_fee_amount', monthly_fee_amount,
      'first_monthly_fee_date', first_monthly_fee_date,
      'monthly_fee_payment_method', monthly_fee_payment_method,
      'material_amount', material_amount,
      'material_payment_date', material_payment_date,
      'material_payment_method', material_payment_method,
      'material_installments', material_installments,
      'commercial_observations', commercial_observations,
      'updated_at', updated_at
    ) INTO v_result;
  
  RAISE NOTICE 'LOG: Dados comerciais salvos com sucesso';
  RETURN v_result;
END;
$$;

-- 6. Atualizar função check_commercial_data_complete para trabalhar com ENUM
CREATE OR REPLACE FUNCTION check_commercial_data_complete(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_complete boolean := false;
BEGIN
  -- LOG: Verificando completude dos dados comerciais com ENUM kit_type
  RAISE NOTICE 'LOG: Verificando dados completos para atividade %', p_activity_id;
  
  SELECT (
    kit_type IS NOT NULL AND
    enrollment_amount IS NOT NULL AND
    enrollment_payment_date IS NOT NULL AND
    enrollment_payment_method IS NOT NULL AND
    monthly_fee_amount IS NOT NULL AND
    first_monthly_fee_date IS NOT NULL AND
    monthly_fee_payment_method IS NOT NULL AND
    material_amount IS NOT NULL AND
    material_payment_date IS NOT NULL AND
    material_payment_method IS NOT NULL
  ) INTO v_complete
  FROM atividade_pos_venda
  WHERE id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados completos: %', COALESCE(v_complete, false);
  RETURN COALESCE(v_complete, false);
END;
$$;