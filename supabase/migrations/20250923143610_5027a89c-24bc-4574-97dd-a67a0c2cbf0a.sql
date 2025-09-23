-- Criar tabela de atividades de pós-venda
CREATE TABLE public.atividade_pos_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  client_activity_id UUID NOT NULL UNIQUE, -- 1-to-1 com client_activities tipo "Matrícula"
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Dados do client (desnormalizados para performance)
  client_name TEXT NOT NULL,
  
  -- Campos da tabela students (todos opcionais)
  full_name TEXT,
  cpf TEXT,
  rg TEXT,
  birth_date DATE,
  address_postal_code TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  photo_url TEXT,
  photo_thumbnail_url TEXT,
  
  -- Campos adicionais para controle
  active BOOLEAN NOT NULL DEFAULT true
);

-- Criar tabela de configuração de atividades dinâmicas
CREATE TABLE public.pos_venda_atividades_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Criar tabela de atividades realizadas (checkboxes dinâmicos)
CREATE TABLE public.pos_venda_atividades_realizadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  atividade_pos_venda_id UUID NOT NULL,
  atividade_config_id UUID NOT NULL,
  realizada BOOLEAN NOT NULL DEFAULT false,
  data_realizacao TIMESTAMP WITH TIME ZONE,
  usuario_realizou UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(atividade_pos_venda_id, atividade_config_id)
);

-- Habilitar RLS
ALTER TABLE public.atividade_pos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_venda_atividades_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_venda_atividades_realizadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para atividade_pos_venda
CREATE POLICY "Users can view pos venda activities from their units" 
ON public.atividade_pos_venda 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = atividade_pos_venda.client_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

CREATE POLICY "Users can insert pos venda activities" 
ON public.atividade_pos_venda 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = client_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

CREATE POLICY "Users can update pos venda activities from their units" 
ON public.atividade_pos_venda 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM clients c
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE c.id = atividade_pos_venda.client_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

-- Políticas RLS para pos_venda_atividades_config
CREATE POLICY "Users can view activities config from their units" 
ON public.pos_venda_atividades_config 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM unit_users uu
    WHERE uu.unit_id = pos_venda_atividades_config.unit_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

CREATE POLICY "Users can manage activities config from their units" 
ON public.pos_venda_atividades_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM unit_users uu
    WHERE uu.unit_id = pos_venda_atividades_config.unit_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

-- Políticas RLS para pos_venda_atividades_realizadas
CREATE POLICY "Users can view realized activities from their units" 
ON public.pos_venda_atividades_realizadas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM atividade_pos_venda apv
    JOIN clients c ON apv.client_id = c.id
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE apv.id = pos_venda_atividades_realizadas.atividade_pos_venda_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

CREATE POLICY "Users can manage realized activities from their units" 
ON public.pos_venda_atividades_realizadas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM atividade_pos_venda apv
    JOIN clients c ON apv.client_id = c.id
    JOIN unit_users uu ON c.unit_id = uu.unit_id
    WHERE apv.id = pos_venda_atividades_realizadas.atividade_pos_venda_id
    AND uu.user_id = auth.uid()
    AND uu.active = true
  )
);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_pos_venda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_atividade_pos_venda_updated_at
BEFORE UPDATE ON public.atividade_pos_venda
FOR EACH ROW
EXECUTE FUNCTION update_pos_venda_updated_at();

CREATE TRIGGER update_pos_venda_atividades_config_updated_at
BEFORE UPDATE ON public.pos_venda_atividades_config
FOR EACH ROW
EXECUTE FUNCTION update_pos_venda_updated_at();

CREATE TRIGGER update_pos_venda_atividades_realizadas_updated_at
BEFORE UPDATE ON public.pos_venda_atividades_realizadas
FOR EACH ROW
EXECUTE FUNCTION update_pos_venda_updated_at();

-- Trigger para criar automaticamente atividade_pos_venda quando client_activities tipo "Matrícula" é inserida
CREATE OR REPLACE FUNCTION create_pos_venda_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Só processa se for atividade do tipo "Matrícula"
  IF NEW.tipo_atividade = 'Matrícula' THEN
    INSERT INTO public.atividade_pos_venda (
      client_id,
      client_activity_id,
      created_by,
      client_name
    )
    SELECT 
      NEW.client_id,
      NEW.id,
      NEW.created_by,
      c.name
    FROM clients c
    WHERE c.id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_pos_venda_activity
AFTER INSERT ON public.client_activities
FOR EACH ROW
EXECUTE FUNCTION create_pos_venda_activity();