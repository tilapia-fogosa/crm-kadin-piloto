-- Log: Adicionar sistema de mensagens não lidas na tabela historico_comercial
-- Etapa 1: Adicionar coluna lida (boolean) para indicar se mensagem foi lida pela equipe
-- Etapa 2: Adicionar coluna lida_em (timestamp) para registrar quando foi lida
-- Etapa 3: Marcar mensagens existentes enviadas por nós (from_me = true) como já lidas
-- Etapa 4: Criar índice para melhorar performance das queries de mensagens não lidas

ALTER TABLE historico_comercial 
ADD COLUMN IF NOT EXISTS lida BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lida_em TIMESTAMP WITH TIME ZONE;

-- Marcar mensagens existentes enviadas pela equipe como já lidas
UPDATE historico_comercial 
SET lida = true, 
    lida_em = created_at
WHERE from_me = true AND lida IS NULL;

-- Criar índice para queries de mensagens não lidas (melhora performance)
CREATE INDEX IF NOT EXISTS idx_historico_comercial_lida 
ON historico_comercial(client_id, lida, from_me) 
WHERE lida = false;

-- Comentários explicativos
COMMENT ON COLUMN historico_comercial.lida IS 'Indica se a mensagem foi lida pela equipe (por equipe, não por usuário individual)';
COMMENT ON COLUMN historico_comercial.lida_em IS 'Data e hora em que a mensagem foi marcada como lida pela equipe';