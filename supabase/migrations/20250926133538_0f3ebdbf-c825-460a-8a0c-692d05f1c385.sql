-- Adicionar colunas para dados comerciais na tabela atividade_pos_venda
ALTER TABLE atividade_pos_venda ADD COLUMN kit_type_id uuid REFERENCES kit_types(id);
ALTER TABLE atividade_pos_venda ADD COLUMN enrollment_amount DECIMAL(10,2);
ALTER TABLE atividade_pos_venda ADD COLUMN enrollment_payment_date DATE;
ALTER TABLE atividade_pos_venda ADD COLUMN enrollment_payment_method payment_method;
ALTER TABLE atividade_pos_venda ADD COLUMN enrollment_installments INTEGER CHECK (enrollment_installments BETWEEN 1 AND 12);
ALTER TABLE atividade_pos_venda ADD COLUMN monthly_fee_amount DECIMAL(10,2);
ALTER TABLE atividade_pos_venda ADD COLUMN first_monthly_fee_date DATE;
ALTER TABLE atividade_pos_venda ADD COLUMN monthly_fee_payment_method payment_method;
ALTER TABLE atividade_pos_venda ADD COLUMN material_amount DECIMAL(10,2);
ALTER TABLE atividade_pos_venda ADD COLUMN material_payment_date DATE;
ALTER TABLE atividade_pos_venda ADD COLUMN material_payment_method payment_method;
ALTER TABLE atividade_pos_venda ADD COLUMN material_installments INTEGER CHECK (material_installments BETWEEN 1 AND 12);
ALTER TABLE atividade_pos_venda ADD COLUMN commercial_observations TEXT;

-- Função para buscar dados comerciais
CREATE OR REPLACE FUNCTION get_pos_venda_commercial_data(p_activity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  -- LOG: Buscando dados comerciais da atividade pós-venda
  RAISE NOTICE 'LOG: Buscando dados comerciais para atividade %', p_activity_id;
  
  SELECT 
    jsonb_build_object(
      'kit_type_id', apv.kit_type_id,
      'kit_type_name', kt.name,
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
      'observations', apv.commercial_observations
    ) INTO v_result
  FROM atividade_pos_venda apv
  LEFT JOIN kit_types kt ON apv.kit_type_id = kt.id
  WHERE apv.id = p_activity_id;
  
  IF v_result IS NULL THEN
    RAISE NOTICE 'LOG: Nenhum dado comercial encontrado';
    RETURN '{}'::jsonb;
  END IF;
  
  RAISE NOTICE 'LOG: Dados comerciais encontrados';
  RETURN v_result;
END;
$function$;

-- Função para salvar/atualizar dados comerciais
CREATE OR REPLACE FUNCTION save_pos_venda_commercial_data(
  p_activity_id uuid,
  p_kit_type_id uuid DEFAULT NULL,
  p_enrollment_amount decimal DEFAULT NULL,
  p_enrollment_payment_date date DEFAULT NULL,
  p_enrollment_payment_method payment_method DEFAULT NULL,
  p_enrollment_installments integer DEFAULT NULL,
  p_monthly_fee_amount decimal DEFAULT NULL,
  p_first_monthly_fee_date date DEFAULT NULL,
  p_monthly_fee_payment_method payment_method DEFAULT NULL,
  p_material_amount decimal DEFAULT NULL,
  p_material_payment_date date DEFAULT NULL,
  p_material_payment_method payment_method DEFAULT NULL,
  p_material_installments integer DEFAULT NULL,
  p_observations text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- LOG: Salvando dados comerciais
  RAISE NOTICE 'LOG: Salvando dados comerciais para atividade %', p_activity_id;
  
  -- Verificar usuário autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se a atividade existe e o usuário tem permissão
  IF NOT EXISTS (
    SELECT 1 FROM atividade_pos_venda apv
    JOIN clients c ON apv.client_id = c.id
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE apv.id = p_activity_id
    AND uu.user_id = v_user_id
    AND uu.active = true
  ) THEN
    RAISE EXCEPTION 'Atividade não encontrada ou sem permissão';
  END IF;
  
  -- Atualizar dados comerciais
  UPDATE atividade_pos_venda
  SET 
    kit_type_id = p_kit_type_id,
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
    commercial_observations = p_observations,
    updated_at = NOW()
  WHERE id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados comerciais salvos com sucesso';
  RETURN true;
END;
$function$;

-- Função para verificar se dados comerciais estão completos
CREATE OR REPLACE FUNCTION check_commercial_data_complete(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_complete boolean;
BEGIN
  -- LOG: Verificando se dados comerciais estão completos
  RAISE NOTICE 'LOG: Verificando completude dos dados comerciais para atividade %', p_activity_id;
  
  SELECT 
    (kit_type_id IS NOT NULL AND
     enrollment_amount IS NOT NULL AND
     enrollment_payment_date IS NOT NULL AND
     enrollment_payment_method IS NOT NULL AND
     enrollment_installments IS NOT NULL AND
     monthly_fee_amount IS NOT NULL AND
     first_monthly_fee_date IS NOT NULL AND
     monthly_fee_payment_method IS NOT NULL AND
     material_amount IS NOT NULL AND
     material_payment_date IS NOT NULL AND
     material_payment_method IS NOT NULL AND
     material_installments IS NOT NULL AND
     commercial_observations IS NOT NULL)
  INTO v_complete
  FROM atividade_pos_venda
  WHERE id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados comerciais completos: %', COALESCE(v_complete, false);
  RETURN COALESCE(v_complete, false);
END;
$function$;