-- Criar tabela para mensagens automáticas do WhatsApp
-- Log: Tabela para armazenar mensagens automáticas (Boas vindas e Valorização)
CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens_automaticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('boas_vindas', 'valorizacao')),
  mensagem TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Garante que cada usuário tenha apenas uma mensagem de cada tipo
  UNIQUE(profile_id, tipo)
);

-- Comentários na tabela
COMMENT ON TABLE public.whatsapp_mensagens_automaticas IS 'Mensagens automáticas do WhatsApp (Boas vindas e Valorização)';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.tipo IS 'Tipo da mensagem: boas_vindas ou valorizacao';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.mensagem IS 'Conteúdo da mensagem automática com suporte a variáveis {{nome}}, {{primeiro_nome}}, etc';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.ativo IS 'Se a mensagem automática está ativa ou não';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_auto_profile ON public.whatsapp_mensagens_automaticas(profile_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_auto_tipo ON public.whatsapp_mensagens_automaticas(tipo);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_auto_ativo ON public.whatsapp_mensagens_automaticas(ativo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_mensagens_automaticas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_whatsapp_mensagens_automaticas
  BEFORE UPDATE ON public.whatsapp_mensagens_automaticas
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_mensagens_automaticas_updated_at();

-- RLS Policies
ALTER TABLE public.whatsapp_mensagens_automaticas ENABLE ROW LEVEL SECURITY;

-- Usuários podem visualizar suas próprias mensagens automáticas
CREATE POLICY "Users can view their own automatic messages"
  ON public.whatsapp_mensagens_automaticas
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Usuários podem atualizar suas próprias mensagens automáticas (mas não criar ou deletar)
CREATE POLICY "Users can update their own automatic messages"
  ON public.whatsapp_mensagens_automaticas
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Função para inicializar mensagens automáticas para novo usuário
CREATE OR REPLACE FUNCTION initialize_whatsapp_auto_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir mensagem de boas vindas
  INSERT INTO public.whatsapp_mensagens_automaticas (profile_id, tipo, mensagem, ativo)
  VALUES (
    NEW.id,
    'boas_vindas',
    'Olá {{primeiro_nome}}, seja bem-vindo(a)! Estamos felizes em ter você conosco. 😊',
    false
  );
  
  -- Inserir mensagem de valorização
  INSERT INTO public.whatsapp_mensagens_automaticas (profile_id, tipo, mensagem, ativo)
  VALUES (
    NEW.id,
    'valorizacao',
    'Oi {{primeiro_nome}}! Gostaríamos de saber mais sobre seu interesse. Quando podemos conversar? 📞',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar mensagens automáticas quando um novo usuário se registra
CREATE TRIGGER trigger_initialize_whatsapp_auto_messages
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_whatsapp_auto_messages();