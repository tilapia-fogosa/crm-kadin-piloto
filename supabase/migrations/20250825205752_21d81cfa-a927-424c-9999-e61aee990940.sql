-- ETAPA 1: Sistema de Funcionalidades por Unidade
-- Log: Criando ENUM para tipos de funcionalidades em português brasileiro
CREATE TYPE tipo_funcionalidade AS ENUM (
  'assistente_whatsapp',
  'google_agenda', 
  'relatorios_avancados',
  'integracao_telefonia_net2phone'
);

-- Log: Criando tabela principal de funcionalidades por unidade
CREATE TABLE funcionalidades_unidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  tipo_funcionalidade tipo_funcionalidade NOT NULL,
  ativa BOOLEAN NOT NULL DEFAULT false,
  configuracao JSONB DEFAULT '{}',
  usuario_habilitou UUID REFERENCES auth.users(id),
  data_habilitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint de unicidade: uma unidade pode ter apenas uma configuração por funcionalidade
  UNIQUE(unit_id, tipo_funcionalidade)
);

-- Log: Criando índices para performance
CREATE INDEX idx_funcionalidades_unidade_unit_id ON funcionalidades_unidade(unit_id);
CREATE INDEX idx_funcionalidades_unidade_tipo ON funcionalidades_unidade(tipo_funcionalidade);
CREATE INDEX idx_funcionalidades_unidade_ativa ON funcionalidades_unidade(ativa) WHERE ativa = true;

-- Log: Habilitando RLS na tabela
ALTER TABLE funcionalidades_unidade ENABLE ROW LEVEL SECURITY;

-- Log: Política RLS - usuários podem ver funcionalidades de suas unidades
CREATE POLICY "Usuários podem ver funcionalidades de suas unidades" 
ON funcionalidades_unidade FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM unit_users uu 
    WHERE uu.unit_id = funcionalidades_unidade.unit_id 
    AND uu.user_id = auth.uid() 
    AND uu.active = true
  )
);

-- Log: Política RLS - apenas admins podem gerenciar funcionalidades
CREATE POLICY "Admins podem gerenciar funcionalidades" 
ON funcionalidades_unidade FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
  )
);

-- Log: Criando função para verificar se unidade tem funcionalidade ativa
CREATE OR REPLACE FUNCTION unidade_tem_funcionalidade(
  p_unit_id UUID, 
  p_tipo_funcionalidade tipo_funcionalidade
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM funcionalidades_unidade fu
    WHERE fu.unit_id = p_unit_id 
    AND fu.tipo_funcionalidade = p_tipo_funcionalidade
    AND fu.ativa = true
  );
END;
$$;

-- Log: Criando função para obter configuração de funcionalidade
CREATE OR REPLACE FUNCTION obter_config_funcionalidade(
  p_unit_id UUID, 
  p_tipo_funcionalidade tipo_funcionalidade
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config JSONB;
BEGIN
  SELECT configuracao INTO v_config
  FROM funcionalidades_unidade fu
  WHERE fu.unit_id = p_unit_id 
  AND fu.tipo_funcionalidade = p_tipo_funcionalidade
  AND fu.ativa = true;
  
  RETURN COALESCE(v_config, '{}'::jsonb);
END;
$$;

-- Log: Criando trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_funcionalidades_unidade_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_funcionalidades_unidade_updated_at
  BEFORE UPDATE ON funcionalidades_unidade
  FOR EACH ROW
  EXECUTE FUNCTION update_funcionalidades_unidade_updated_at();