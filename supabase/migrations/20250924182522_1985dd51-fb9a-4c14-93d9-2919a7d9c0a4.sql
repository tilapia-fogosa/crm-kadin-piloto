-- LOG: Corrigindo RLS para tabelas pos_venda relacionadas

-- Habilitar RLS nas tabelas que foram modificadas
ALTER TABLE pos_venda_atividades_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_venda_atividades_realizadas ENABLE ROW LEVEL SECURITY;

-- Políticas para pos_venda_atividades_config
CREATE POLICY "Users can view config from their units" 
ON pos_venda_atividades_config 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM unit_users uu 
  WHERE uu.unit_id = pos_venda_atividades_config.unit_id 
  AND uu.user_id = auth.uid() 
  AND uu.active = true
));

CREATE POLICY "Users can manage config from their units" 
ON pos_venda_atividades_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM unit_users uu 
  WHERE uu.unit_id = pos_venda_atividades_config.unit_id 
  AND uu.user_id = auth.uid() 
  AND uu.active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM unit_users uu 
  WHERE uu.unit_id = pos_venda_atividades_config.unit_id 
  AND uu.user_id = auth.uid() 
  AND uu.active = true
));

-- Políticas para pos_venda_atividades_realizadas
CREATE POLICY "Users can view realizadas from their units" 
ON pos_venda_atividades_realizadas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pos_venda_atividades_config pac
  JOIN unit_users uu ON pac.unit_id = uu.unit_id
  WHERE pac.id = pos_venda_atividades_realizadas.atividade_config_id
  AND uu.user_id = auth.uid() 
  AND uu.active = true
));

CREATE POLICY "Users can manage realizadas from their units" 
ON pos_venda_atividades_realizadas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM pos_venda_atividades_config pac
  JOIN unit_users uu ON pac.unit_id = uu.unit_id
  WHERE pac.id = pos_venda_atividades_realizadas.atividade_config_id
  AND uu.user_id = auth.uid() 
  AND uu.active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM pos_venda_atividades_config pac
  JOIN unit_users uu ON pac.unit_id = uu.unit_id
  WHERE pac.id = pos_venda_atividades_realizadas.atividade_config_id
  AND uu.user_id = auth.uid() 
  AND uu.active = true
));