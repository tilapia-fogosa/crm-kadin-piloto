-- Log: Ajuste de política RLS da tabela profiles
-- Objetivo: Permitir que usuários autenticados vejam todos os perfis
-- Motivo: Necessário para exibir o nome do remetente no chat do WhatsApp
-- quando a query faz join com profiles:created_by (full_name)

-- Etapa 1: Remover política restritiva antiga
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Etapa 2: Criar nova política que permite leitura de todos os perfis para usuários autenticados
-- Isso é necessário para joins e não expõe dados sensíveis (apenas id, full_name, avatar_url)
CREATE POLICY "Authenticated users can view all profiles for joins"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Etapa 3: Garantir que as políticas de UPDATE e INSERT continuam restritas
-- (cada usuário só pode editar seu próprio perfil)
-- Essas políticas já existem, mas vamos garantir que estão corretas

-- Log: Política de UPDATE - usuários só podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Log: Política de INSERT - usuários só podem inserir seu próprio perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);