-- LOG: Fase 1 - Adicionando colunas para dados pedagógicos na tabela atividade_pos_venda
ALTER TABLE atividade_pos_venda
ADD COLUMN IF NOT EXISTS turma_id uuid REFERENCES turmas(id),
ADD COLUMN IF NOT EXISTS data_aula_inaugural date,
ADD COLUMN IF NOT EXISTS informacoes_onboarding text;

-- LOG: Criando índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_atividade_pos_venda_turma_id 
ON atividade_pos_venda(turma_id);

COMMENT ON COLUMN atividade_pos_venda.turma_id IS 'Turma em que o aluno foi matriculado';
COMMENT ON COLUMN atividade_pos_venda.data_aula_inaugural IS 'Data da primeira aula do aluno';
COMMENT ON COLUMN atividade_pos_venda.informacoes_onboarding IS 'Informações coletadas durante o onboarding/atendimento pedagógico';

-- LOG: Função para buscar turmas com informações do professor
CREATE OR REPLACE FUNCTION get_turmas_with_professor(p_unit_id uuid)
RETURNS TABLE(
  turma_id uuid,
  turma_nome text,
  turma_sala text,
  turma_dia_semana dia_semana,
  turma_active boolean,
  professor_id uuid,
  professor_nome text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'LOG: Buscando turmas com professores para unidade %', p_unit_id;
  
  RETURN QUERY
  SELECT 
    t.id as turma_id,
    t.nome as turma_nome,
    t.sala as turma_sala,
    t.dia_semana as turma_dia_semana,
    t.active as turma_active,
    p.id as professor_id,
    p.nome as professor_nome
  FROM turmas t
  INNER JOIN professores p ON t.professor_id = p.id
  WHERE t.unit_id = p_unit_id
    AND t.active = true
    AND p.status = true
  ORDER BY t.nome ASC;
  
  RAISE NOTICE 'LOG: Turmas encontradas com sucesso';
END;
$$;

-- LOG: Função para buscar dados pedagógicos
CREATE OR REPLACE FUNCTION get_pos_venda_pedagogical_data(p_activity_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  RAISE NOTICE 'LOG: Buscando dados pedagógicos para atividade %', p_activity_id;
  
  SELECT jsonb_build_object(
    'turma_id', turma_id,
    'data_aula_inaugural', data_aula_inaugural,
    'informacoes_onboarding', informacoes_onboarding
  ) INTO v_result
  FROM atividade_pos_venda
  WHERE id = p_activity_id;
  
  IF v_result IS NULL THEN
    RAISE NOTICE 'LOG: Nenhum dado pedagógico encontrado, retornando objeto vazio';
    RETURN '{}'::jsonb;
  END IF;
  
  RAISE NOTICE 'LOG: Dados pedagógicos encontrados';
  RETURN v_result;
END;
$$;

-- LOG: Função para salvar dados pedagógicos
CREATE OR REPLACE FUNCTION save_pos_venda_pedagogical_data(
  p_activity_id uuid,
  p_turma_id uuid DEFAULT NULL,
  p_data_aula_inaugural date DEFAULT NULL,
  p_informacoes_onboarding text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  RAISE NOTICE 'LOG: Salvando dados pedagógicos para atividade %', p_activity_id;
  
  UPDATE atividade_pos_venda
  SET 
    turma_id = p_turma_id,
    data_aula_inaugural = p_data_aula_inaugural,
    informacoes_onboarding = p_informacoes_onboarding,
    updated_at = NOW()
  WHERE id = p_activity_id
  RETURNING jsonb_build_object(
    'turma_id', turma_id,
    'data_aula_inaugural', data_aula_inaugural,
    'informacoes_onboarding', informacoes_onboarding
  ) INTO v_result;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Atividade pós-venda não encontrada com id %', p_activity_id;
  END IF;
  
  RAISE NOTICE 'LOG: Dados pedagógicos salvos com sucesso';
  RETURN v_result;
END;
$$;

-- LOG: Função para verificar se dados pedagógicos estão completos
CREATE OR REPLACE FUNCTION check_pedagogical_data_complete(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_complete boolean;
BEGIN
  RAISE NOTICE 'LOG: Verificando completude dos dados pedagógicos para %', p_activity_id;
  
  SELECT (
    turma_id IS NOT NULL AND
    data_aula_inaugural IS NOT NULL AND
    informacoes_onboarding IS NOT NULL AND
    informacoes_onboarding != ''
  ) INTO v_complete
  FROM atividade_pos_venda
  WHERE id = p_activity_id;
  
  RAISE NOTICE 'LOG: Dados pedagógicos completos: %', v_complete;
  RETURN COALESCE(v_complete, false);
END;
$$;