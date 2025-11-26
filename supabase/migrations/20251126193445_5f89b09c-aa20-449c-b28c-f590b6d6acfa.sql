-- Corrigir mensagens automáticas para serem vinculadas à unidade
-- Log: Alterar estrutura de mensagens automáticas para unit_id

-- 1. Remover a tabela anterior
DROP TRIGGER IF EXISTS trigger_initialize_whatsapp_auto_messages ON auth.users;
DROP FUNCTION IF EXISTS initialize_whatsapp_auto_messages();
DROP TABLE IF EXISTS public.whatsapp_mensagens_automaticas CASCADE;

-- 2. Recriar tabela com unit_id
CREATE TABLE public.whatsapp_mensagens_automaticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('boas_vindas', 'valorizacao')),
  mensagem TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Garante que cada unidade tenha apenas uma mensagem de cada tipo
  UNIQUE(unit_id, tipo)
);

-- Comentários na tabela
COMMENT ON TABLE public.whatsapp_mensagens_automaticas IS 'Mensagens automáticas do WhatsApp por unidade (Boas vindas e Valorização)';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.unit_id IS 'ID da unidade dona das mensagens automáticas';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.tipo IS 'Tipo da mensagem: boas_vindas ou valorizacao';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.mensagem IS 'Conteúdo da mensagem automática com suporte a variáveis {{nome}}, {{primeiro_nome}}, etc';
COMMENT ON COLUMN public.whatsapp_mensagens_automaticas.ativo IS 'Se a mensagem automática está ativa ou não';

-- Índices para melhor performance
CREATE INDEX idx_whatsapp_msg_auto_unit ON public.whatsapp_mensagens_automaticas(unit_id);
CREATE INDEX idx_whatsapp_msg_auto_tipo ON public.whatsapp_mensagens_automaticas(tipo);
CREATE INDEX idx_whatsapp_msg_auto_ativo ON public.whatsapp_mensagens_automaticas(ativo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_mensagens_automaticas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_whatsapp_mensagens_automaticas
  BEFORE UPDATE ON public.whatsapp_mensagens_automaticas
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_mensagens_automaticas_updated_at();

-- RLS Policies
ALTER TABLE public.whatsapp_mensagens_automaticas ENABLE ROW LEVEL SECURITY;

-- Usuários podem visualizar mensagens das unidades que têm acesso
CREATE POLICY "Users can view automatic messages from their units"
  ON public.whatsapp_mensagens_automaticas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.unit_users
      WHERE unit_users.unit_id = whatsapp_mensagens_automaticas.unit_id
        AND unit_users.user_id = auth.uid()
        AND unit_users.active = true
    )
  );

-- Usuários podem atualizar mensagens das unidades que têm acesso
CREATE POLICY "Users can update automatic messages from their units"
  ON public.whatsapp_mensagens_automaticas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.unit_users
      WHERE unit_users.unit_id = whatsapp_mensagens_automaticas.unit_id
        AND unit_users.user_id = auth.uid()
        AND unit_users.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.unit_users
      WHERE unit_users.unit_id = whatsapp_mensagens_automaticas.unit_id
        AND unit_users.user_id = auth.uid()
        AND unit_users.active = true
    )
  );

-- Função para inicializar mensagens automáticas para nova unidade
CREATE OR REPLACE FUNCTION initialize_unit_whatsapp_auto_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir mensagem de boas vindas
  INSERT INTO public.whatsapp_mensagens_automaticas (unit_id, tipo, mensagem, ativo)
  VALUES (
    NEW.id,
    'boas_vindas',
    'Olá {{primeiro_nome}}, seja bem-vindo(a)! Estamos felizes em ter você conosco. 😊',
    false
  );
  
  -- Inserir mensagem de valorização
  INSERT INTO public.whatsapp_mensagens_automaticas (unit_id, tipo, mensagem, ativo)
  VALUES (
    NEW.id,
    'valorizacao',
    'Oi {{primeiro_nome}}! Gostaríamos de saber mais sobre seu interesse. Quando podemos conversar? 📞',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar mensagens automáticas quando uma nova unidade é criada
CREATE TRIGGER trigger_initialize_unit_whatsapp_auto_messages
  AFTER INSERT ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION initialize_unit_whatsapp_auto_messages();