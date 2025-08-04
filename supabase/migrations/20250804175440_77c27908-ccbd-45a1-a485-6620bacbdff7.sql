
-- Verificar se RLS está ativado nas tabelas principais
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerlsforowners as force_rls_for_owners
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_activities', 'client_webhooks', 'client_webhook_logs', 'profiles', 'units', 'unit_users')
ORDER BY tablename;

-- Verificar as políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('clients', 'client_activities', 'client_webhooks', 'client_webhook_logs', 'profiles', 'units', 'unit_users')
ORDER BY tablename, policyname;

-- Verificar funções de segurança relacionadas
SELECT 
    routine_name,
    routine_type,
    security_type,
    is_deterministic
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%' OR routine_name LIKE '%access%' OR routine_name LIKE '%admin%'
ORDER BY routine_name;
