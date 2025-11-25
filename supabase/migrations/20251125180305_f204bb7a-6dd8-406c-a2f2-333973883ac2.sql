-- Criar políticas RLS para historico_comercial
-- Permite que usuários visualizem e insiram mensagens para clientes das suas unidades

-- Log: Criando política para visualizar mensagens
-- Permite que usuários vejam mensagens de clientes nas unidades onde têm acesso
CREATE POLICY "Users can view messages from their units"
ON historico_comercial
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

-- Log: Criando política para inserir mensagens
-- Permite que usuários insiram mensagens para clientes das suas unidades
CREATE POLICY "Users can insert messages for their units"
ON historico_comercial
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);