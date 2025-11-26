-- Inserir mensagens automáticas padrão para Maringá
INSERT INTO public.whatsapp_mensagens_automaticas (unit_id, tipo, mensagem, ativo)
VALUES 
  (
    '0df79a04-444e-46ee-b218-59e4b1835f4a',
    'boas_vindas',
    'Olá! Seja bem-vindo(a) ao Supera Maringá! 🎉 Estamos felizes em tê-lo(a) conosco. Como podemos ajudá-lo(a) hoje?',
    true
  ),
  (
    '0df79a04-444e-46ee-b218-59e4b1835f4a',
    'valorizacao',
    'Olá! Que bom ter você por aqui! 😊 Valorizamos muito sua presença e queremos proporcionar a melhor experiência para você. Em que posso ajudar?',
    true
  )
ON CONFLICT (unit_id, tipo) DO NOTHING;