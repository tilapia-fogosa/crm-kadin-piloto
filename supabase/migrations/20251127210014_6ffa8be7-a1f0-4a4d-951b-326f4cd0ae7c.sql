-- Etapa 1: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view messages from their units" ON historico_comercial;
DROP POLICY IF EXISTS "Users can insert messages for their units" ON historico_comercial;
DROP POLICY IF EXISTS "Users can update messages from their units" ON historico_comercial;

-- Etapa 2: Criar política SELECT corrigida
-- Permite ver mensagens de clientes cadastrados OU mensagens sem client_id da mesma unidade
CREATE POLICY "Users can view messages from their units" 
ON historico_comercial FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id 
      AND uu.user_id = auth.uid() 
      AND uu.active = true
  )
  OR
  (
    historico_comercial.client_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM unit_users uu
      WHERE uu.unit_id = historico_comercial.unit_id
        AND uu.user_id = auth.uid()
        AND uu.active = true
    )
  )
);

-- Etapa 3: Criar política INSERT corrigida
CREATE POLICY "Users can insert messages for their units" 
ON historico_comercial FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id 
      AND uu.user_id = auth.uid() 
      AND uu.active = true
  )
  OR
  (
    historico_comercial.client_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM unit_users uu
      WHERE uu.unit_id = historico_comercial.unit_id
        AND uu.user_id = auth.uid()
        AND uu.active = true
    )
  )
);

-- Etapa 4: Criar política UPDATE corrigida
CREATE POLICY "Users can update messages from their units" 
ON historico_comercial FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id 
      AND uu.user_id = auth.uid() 
      AND uu.active = true
  )
  OR
  (
    historico_comercial.client_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM unit_users uu
      WHERE uu.unit_id = historico_comercial.unit_id
        AND uu.user_id = auth.uid()
        AND uu.active = true
    )
  )
);