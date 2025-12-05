-- Remove a coluna role da tabela profiles
-- Esta coluna não é mais utilizada - o sistema de roles real está em unit_users
-- A coluna is_admin será mantida para admins globais do sistema

ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Adicionar comentário explicativo na coluna is_admin
COMMENT ON COLUMN profiles.is_admin IS 'Admin global do sistema - acesso total a todas unidades. Diferente de unit_users.role=admin que é admin apenas de uma unidade específica.';