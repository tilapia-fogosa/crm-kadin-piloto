-- Criar política de UPDATE para historico_comercial
-- Permite que usuários atualizem mensagens de clientes das suas unidades
CREATE POLICY "Users can update messages from their units"
ON public.historico_comercial
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id
      AND uu.user_id = auth.uid()
      AND uu.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = historico_comercial.client_id
      AND uu.user_id = auth.uid()
      AND uu.active = true
  )
);