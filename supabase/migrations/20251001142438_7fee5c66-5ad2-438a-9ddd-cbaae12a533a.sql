-- LOG: Adicionar campos de confirmação de pagamento e remover observações comerciais
-- Etapa 1: Adicionar novas colunas boolean para confirmações de pagamento

ALTER TABLE atividade_pos_venda 
ADD COLUMN IF NOT EXISTS enrollment_payment_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS material_payment_confirmed BOOLEAN DEFAULT FALSE;

-- LOG: Colunas de confirmação adicionadas com sucesso

-- Etapa 2: Atualizar função RPC para salvar dados comerciais
CREATE OR REPLACE FUNCTION save_pos_venda_commercial_data(
  p_activity_id UUID,
  p_kit_type kit_type DEFAULT NULL,
  p_enrollment_amount NUMERIC DEFAULT NULL,
  p_enrollment_payment_date DATE DEFAULT NULL,
  p_enrollment_payment_method payment_method DEFAULT NULL,
  p_enrollment_installments INTEGER DEFAULT NULL,
  p_monthly_fee_amount NUMERIC DEFAULT NULL,
  p_first_monthly_fee_date DATE DEFAULT NULL,
  p_monthly_fee_payment_method payment_method DEFAULT NULL,
  p_material_amount NUMERIC DEFAULT NULL,
  p_material_payment_date DATE DEFAULT NULL,
  p_material_payment_method payment_method DEFAULT NULL,
  p_material_installments INTEGER DEFAULT NULL,
  p_enrollment_payment_confirmed BOOLEAN DEFAULT FALSE,
  p_material_payment_confirmed BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- LOG: Salvando dados comerciais com confirmações de pagamento
  RAISE NOTICE 'LOG: Salvando dados para atividade % com confirmações', p_activity_id;
  
  -- Atualizar registro existente
  UPDATE atividade_pos_venda
  SET 
    kit_type = p_kit_type,
    enrollment_amount = p_enrollment_amount,
    enrollment_payment_date = p_enrollment_payment_date,
    enrollment_payment_method = p_enrollment_payment_method,
    enrollment_installments = p_enrollment_installments,
    monthly_fee_amount = p_monthly_fee_amount,
    first_monthly_fee_date = p_first_monthly_fee_date,
    monthly_fee_payment_method = p_monthly_fee_payment_method,
    material_amount = p_material_amount,
    material_payment_date = p_material_payment_date,
    material_payment_method = p_material_payment_method,
    material_installments = p_material_installments,
    enrollment_payment_confirmed = p_enrollment_payment_confirmed,
    material_payment_confirmed = p_material_payment_confirmed,
    updated_at = NOW()
  WHERE client_activity_id = p_activity_id
  RETURNING jsonb_build_object(
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
    'enrollment_payment_confirmed', enrollment_payment_confirmed,
    'material_payment_confirmed', material_payment_confirmed
  ) INTO v_result;
  
  RAISE NOTICE 'LOG: Dados comerciais salvos com confirmações';
  RETURN v_result;
END;
$$;

-- LOG: Função save_pos_venda_commercial_data atualizada

-- Etapa 3: Atualizar função RPC para buscar dados comerciais
CREATE OR REPLACE FUNCTION get_pos_venda_commercial_data(
  p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- LOG: Buscando dados comerciais com confirmações
  RAISE NOTICE 'LOG: Buscando dados para atividade %', p_activity_id;
  
  SELECT jsonb_build_object(
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
    'enrollment_payment_confirmed', COALESCE(enrollment_payment_confirmed, false),
    'material_payment_confirmed', COALESCE(material_payment_confirmed, false)
  ) INTO v_result
  FROM atividade_pos_venda
  WHERE client_activity_id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados comerciais retornados com confirmações';
  RETURN v_result;
END;
$$;

-- LOG: Função get_pos_venda_commercial_data atualizada
-- LOG: Migração concluída com sucesso