-- Criar tabela de mensagens automáticas do WhatsApp
-- Log: Tabela para armazenar mensagens automáticas personalizadas por usuário
-- Etapas:
-- 1. Criar tabela com campos: id, profile_id, nome, mensagem, ativo
-- 2. Adicionar foreign key para profiles
-- 3. Criar índice para performance
-- 4. Habilitar RLS
-- 5. Criar política para que usuários vejam apenas suas mensagens

CREATE TABLE public.whatsapp_auto_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para otimizar busca por usuário
CREATE INDEX idx_whatsapp_auto_messages_profile ON public.whatsapp_auto_messages(profile_id);

-- Habilitar Row Level Security
ALTER TABLE public.whatsapp_auto_messages ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem gerenciar suas próprias mensagens
CREATE POLICY "Users can manage own auto messages" 
ON public.whatsapp_auto_messages 
FOR ALL 
USING (profile_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_auto_messages_updated_at
BEFORE UPDATE ON public.whatsapp_auto_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();