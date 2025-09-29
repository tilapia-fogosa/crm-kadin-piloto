-- Log: Atualizando políticas RLS para schedule_occupations
-- Permitir que franqueados e administradores gerenciem ocupações de outros usuários

-- Remover políticas antigas de UPDATE e DELETE
DROP POLICY IF EXISTS "Users can update their own occupations" ON schedule_occupations;
DROP POLICY IF EXISTS "Users can delete their own occupations" ON schedule_occupations;

-- Criar política UPDATE com permissões expandidas
CREATE POLICY "Users can update occupations with proper permissions" 
ON schedule_occupations FOR UPDATE 
USING (
  -- Criador pode editar suas próprias ocupações (com acesso à unidade)
  (auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = schedule_occupations.unit_id 
    AND user_id = auth.uid() 
    AND active = true
  ))
  OR
  -- Admin global pode editar qualquer ocupação
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  ))
  OR
  -- Admin/Franqueado da unidade pode editar ocupações da unidade
  (EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = schedule_occupations.unit_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'franqueado') 
    AND active = true
  ))
);

-- Criar política DELETE com as mesmas permissões
CREATE POLICY "Users can delete occupations with proper permissions" 
ON schedule_occupations FOR DELETE 
USING (
  -- Criador pode deletar suas próprias ocupações (com acesso à unidade)
  (auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = schedule_occupations.unit_id 
    AND user_id = auth.uid() 
    AND active = true
  ))
  OR
  -- Admin global pode deletar qualquer ocupação
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  ))
  OR
  -- Admin/Franqueado da unidade pode deletar ocupações da unidade
  (EXISTS (
    SELECT 1 FROM unit_users 
    WHERE unit_id = schedule_occupations.unit_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'franqueado') 
    AND active = true
  ))
);

-- Log: Políticas RLS atualizadas com sucesso
-- Agora franqueados e administradores podem gerenciar ocupações de todos os usuários da unidade