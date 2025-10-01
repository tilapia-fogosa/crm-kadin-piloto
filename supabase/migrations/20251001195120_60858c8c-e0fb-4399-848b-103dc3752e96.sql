-- LOG: Correção da função save_pos_venda_commercial_data
-- PROBLEMA: Estava usando WHERE client_activity_id = p_activity_id
-- SOLUÇÃO: Mudar para WHERE id = p_activity_id

CREATE OR REPLACE FUNCTION public.save_pos_venda_commercial_data(
  p_activity_id uuid,
  p_kit_type kit_type DEFAULT NULL::kit_type,
  p_enrollment_amount numeric DEFAULT NULL::numeric,
  p_enrollment_payment_date date DEFAULT NULL::date,
  p_enrollment_payment_method payment_method DEFAULT NULL::payment_method,
  p_enrollment_installments integer DEFAULT NULL::integer,
  p_monthly_fee_amount numeric DEFAULT NULL::numeric,
  p_first_monthly_fee_date date DEFAULT NULL::date,
  p_monthly_fee_payment_method payment_method DEFAULT NULL::payment_method,
  p_material_amount numeric DEFAULT NULL::numeric,
  p_material_payment_date date DEFAULT NULL::date,
  p_material_payment_method payment_method DEFAULT NULL::payment_method,
  p_material_installments integer DEFAULT NULL::integer,
  p_enrollment_payment_confirmed boolean DEFAULT false,
  p_material_payment_confirmed boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  -- LOG: Salvando dados comerciais com confirmações de pagamento
  RAISE NOTICE 'LOG: Salvando dados para atividade_pos_venda.id % com confirmações', p_activity_id;
  
  -- CORREÇÃO: Usar id ao invés de client_activity_id no WHERE
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
  WHERE id = p_activity_id  -- CORREÇÃO: buscar por id ao invés de client_activity_id
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
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Atividade pós-venda não encontrada com id %', p_activity_id;
  END IF;
  
  RAISE NOTICE 'LOG: Dados comerciais salvos com confirmações: %', v_result;
  RETURN v_result;
END;
$function$;