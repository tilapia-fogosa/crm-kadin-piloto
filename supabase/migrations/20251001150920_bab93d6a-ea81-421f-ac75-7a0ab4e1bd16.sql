-- LOG: Correção das funções RPC para dados comerciais
-- PROBLEMA 1: get_pos_venda_commercial_data estava buscando por client_activity_id ao invés de id
-- PROBLEMA 2: check_commercial_data_complete não verificava enrollment_payment_confirmed e material_payment_confirmed

-- Recriar função get_pos_venda_commercial_data corrigida
CREATE OR REPLACE FUNCTION public.get_pos_venda_commercial_data(p_activity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  -- LOG: Buscando dados comerciais por ID da atividade_pos_venda (corrigido)
  RAISE NOTICE 'LOG: Buscando dados comerciais para atividade_pos_venda.id %', p_activity_id;
  
  SELECT 
    jsonb_build_object(
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
    ) INTO v_result
  FROM atividade_pos_venda
  WHERE id = p_activity_id;  -- CORREÇÃO: buscar por id ao invés de client_activity_id
  
  IF v_result IS NULL THEN
    RAISE NOTICE 'LOG: Nenhum dado encontrado, retornando objeto vazio';
    RETURN '{}'::jsonb;
  END IF;
  
  RAISE NOTICE 'LOG: Dados comerciais encontrados e retornados';
  RETURN v_result;
END;
$function$;

-- Recriar função check_commercial_data_complete com validação de confirmações
CREATE OR REPLACE FUNCTION public.check_commercial_data_complete(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_is_complete BOOLEAN;
BEGIN
  -- LOG: Verificando completude dos dados comerciais incluindo confirmações de pagamento
  RAISE NOTICE 'LOG: Verificando completude para atividade_pos_venda.id %', p_activity_id;
  
  SELECT EXISTS(
    SELECT 1
    FROM atividade_pos_venda
    WHERE id = p_activity_id
    AND kit_type IS NOT NULL
    AND enrollment_amount IS NOT NULL
    AND enrollment_payment_date IS NOT NULL
    AND enrollment_payment_method IS NOT NULL
    AND monthly_fee_amount IS NOT NULL
    AND first_monthly_fee_date IS NOT NULL
    AND monthly_fee_payment_method IS NOT NULL
    AND material_amount IS NOT NULL
    AND material_payment_date IS NOT NULL
    AND material_payment_method IS NOT NULL
    -- CORREÇÃO: Adicionar verificação das confirmações de pagamento
    AND enrollment_payment_confirmed = true
    AND material_payment_confirmed = true
  ) INTO v_is_complete;
  
  RAISE NOTICE 'LOG: Status de completude (incluindo confirmações): %', v_is_complete;
  RETURN COALESCE(v_is_complete, false);
END;
$function$;