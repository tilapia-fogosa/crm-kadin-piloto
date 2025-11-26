-- Habilitar realtime para tabela historico_comercial
-- Log: Adicionando historico_comercial à publicação supabase_realtime
-- Etapas:
-- 1. Configurar REPLICA IDENTITY FULL para capturar todos os campos nos eventos
-- 2. Adicionar tabela à publicação supabase_realtime

-- Configurar REPLICA IDENTITY FULL
-- Isso garante que o payload do evento contenha todos os campos da linha
ALTER TABLE historico_comercial REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação de realtime
-- Isso permite que eventos INSERT/UPDATE/DELETE sejam transmitidos para clientes conectados
ALTER PUBLICATION supabase_realtime ADD TABLE historico_comercial;