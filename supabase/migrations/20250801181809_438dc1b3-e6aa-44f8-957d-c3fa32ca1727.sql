-- Atualizar a função existente para buscar o nome da unidade ao invés do número
CREATE OR REPLACE FUNCTION public.send_webhook_atendimento_simples()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  client_data RECORD;
  unit_data RECORD;
  http_request_id BIGINT;
  operacao_tipo TEXT;
BEGIN
  -- Determinar o tipo de operação
  operacao_tipo := CASE 
    WHEN TG_OP = 'INSERT' THEN 'criação'
    WHEN TG_OP = 'UPDATE' THEN 'atualização'
    ELSE TG_OP
  END;
  
  -- Log com tipo de operação
  RAISE NOTICE 'Trigger executado (%) para client_id: %, tipo_atividade: %', 
    operacao_tipo, NEW.client_id, NEW.tipo_atividade;
  
  -- Processa atividades do tipo "Atendimento" ou "Agendamento"
  IF NEW.tipo_atividade IN ('Atendimento', 'Agendamento') THEN
    RAISE NOTICE 'Processando webhook para % (operação: %)...', NEW.tipo_atividade, operacao_tipo;
    
    -- Buscar dados do cliente
    SELECT name, phone_number, observations
    INTO client_data
    FROM clients
    WHERE id = NEW.client_id;
    
    -- Buscar dados da unidade (nome ao invés de número)
    SELECT name
    INTO unit_data
    FROM units
    WHERE id = NEW.unit_id;
    
    -- Buscar URL do webhook na tabela dados_importantes (id = 11)
    SELECT data INTO webhook_url
    FROM dados_importantes
    WHERE id = 11;
    
    -- Construir payload incluindo tipo de operação e tipo de atividade
    payload := jsonb_build_object(
      'tipo_operacao', operacao_tipo,
      'tipo_atividade', NEW.tipo_atividade,
      'scheduled_date', NEW.scheduled_date,
      'client_name', client_data.name,
      'phone_number', client_data.phone_number,
      'observations', client_data.observations,
      'unit_name', unit_data.name,
      'activity_id', NEW.id,
      'created_at', NEW.created_at,
      'notes', NEW.notes,
      'tipo_contato', NEW.tipo_contato
    );
    
    -- Enviar requisição HTTP se temos URL
    IF webhook_url IS NOT NULL THEN
      SELECT net.http_post(
        webhook_url,
        payload::text,
        'application/json'
      ) INTO http_request_id;
      
      -- Log da operação
      RAISE NOTICE 'Webhook enviado para % (%). Request ID: %, URL: %, Payload: %', 
        NEW.tipo_atividade, operacao_tipo, http_request_id, webhook_url, payload;
    ELSE
      RAISE WARNING 'Webhook URL não encontrada para id 11 na tabela dados_importantes';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar o novo trigger na tabela client_activities
CREATE TRIGGER client_activities_webhook_trigger 
AFTER INSERT OR UPDATE ON client_activities 
FOR EACH ROW 
EXECUTE FUNCTION send_webhook_atendimento_simples();