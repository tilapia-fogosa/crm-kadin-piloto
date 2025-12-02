-- Adicionar colunas para rastreamento de cadastros duplicados
ALTER TABLE clients 
ADD COLUMN quantidade_cadastros INTEGER DEFAULT 1;

ALTER TABLE clients 
ADD COLUMN historico_cadastros TEXT DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN clients.quantidade_cadastros IS 'Contador de tentativas de cadastro com este telefone';
COMMENT ON COLUMN clients.historico_cadastros IS 'Histórico detalhado de quando o cliente tentou se cadastrar novamente';