-- LOG: Criar trigger automático para recalcular comissões
-- DESCRIÇÃO: Dispara calculate_monthly_commission automaticamente quando dados comerciais são atualizados

-- Função que dispara recálculo automático de comissão
CREATE OR REPLACE FUNCTION trigger_auto_recalculate_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unit_id UUID;
  v_month TEXT;
  v_result JSONB;
BEGIN
  -- LOG: Trigger disparado para recálculo automático
  RAISE NOTICE 'LOG: Auto-recalculating commission for activity %', NEW.id;
  
  -- Buscar unit_id do cliente
  SELECT unit_id INTO v_unit_id
  FROM clients
  WHERE id = NEW.client_id;
  
  -- Extrair mês da venda (usar created_at da atividade)
  v_month := TO_CHAR(NEW.created_at, 'YYYY-MM');
  
  -- Verificar se houve mudança nos campos críticos
  IF (
    OLD.enrollment_payment_confirmed IS DISTINCT FROM NEW.enrollment_payment_confirmed OR
    OLD.material_payment_confirmed IS DISTINCT FROM NEW.material_payment_confirmed OR
    OLD.enrollment_amount IS DISTINCT FROM NEW.enrollment_amount OR
    OLD.material_amount IS DISTINCT FROM NEW.material_amount OR
    OLD.monthly_fee_amount IS DISTINCT FROM NEW.monthly_fee_amount
  ) THEN
    -- Recalcular comissão do consultor no mês
    BEGIN
      SELECT calculate_monthly_commission(
        v_unit_id,
        NEW.created_by,
        v_month,
        true -- Force recalculate
      ) INTO v_result;
      
      RAISE NOTICE 'LOG: Commission recalculated: %', v_result;
    EXCEPTION
      WHEN OTHERS THEN
        -- Se der erro (ex: fórmula não existe), apenas logar
        RAISE WARNING 'LOG: Failed to recalculate commission: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger AFTER UPDATE
DROP TRIGGER IF EXISTS auto_recalculate_commission_on_update ON atividade_pos_venda;

CREATE TRIGGER auto_recalculate_commission_on_update
AFTER UPDATE ON atividade_pos_venda
FOR EACH ROW
WHEN (
  OLD.enrollment_payment_confirmed IS DISTINCT FROM NEW.enrollment_payment_confirmed OR
  OLD.material_payment_confirmed IS DISTINCT FROM NEW.material_payment_confirmed OR
  OLD.enrollment_amount IS DISTINCT FROM NEW.enrollment_amount OR
  OLD.material_amount IS DISTINCT FROM NEW.material_amount OR
  OLD.monthly_fee_amount IS DISTINCT FROM NEW.monthly_fee_amount
)
EXECUTE FUNCTION trigger_auto_recalculate_commission();

-- Criar trigger AFTER INSERT (primeira vez que dados comerciais são salvos)
DROP TRIGGER IF EXISTS auto_calculate_commission_on_insert ON atividade_pos_venda;

CREATE TRIGGER auto_calculate_commission_on_insert
AFTER INSERT ON atividade_pos_venda
FOR EACH ROW
WHEN (
  NEW.enrollment_amount IS NOT NULL OR
  NEW.material_amount IS NOT NULL OR
  NEW.monthly_fee_amount IS NOT NULL
)
EXECUTE FUNCTION trigger_auto_recalculate_commission();

-- LOG: Triggers de recálculo automático criados com sucesso