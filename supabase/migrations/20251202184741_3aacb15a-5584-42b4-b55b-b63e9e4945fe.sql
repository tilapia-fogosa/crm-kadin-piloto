-- Passo 1: Criar função auxiliar para gerar histórico de cadastros
CREATE OR REPLACE FUNCTION generate_registration_history(dates timestamp with time zone[])
RETURNS TEXT AS $$
DECLARE
  result TEXT := '📋 Histórico de cadastros:';
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(dates, 1) LOOP
    result := result || E'\n• Se cadastrou pela ' || i || 'ª vez no dia ' || 
              to_char(dates[i], 'DD/MM/YYYY');
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Passo 2: Atualizar registros mais recentes com quantidade e histórico
WITH duplicates AS (
  SELECT 
    phone_number,
    COUNT(*) as quantidade,
    array_agg(created_at ORDER BY created_at) as datas_cadastro
  FROM clients
  WHERE phone_number IS NOT NULL 
    AND phone_number != '' 
    AND phone_number != '00000000000'
  GROUP BY phone_number
  HAVING COUNT(*) > 1
),
latest_client AS (
  SELECT DISTINCT ON (c.phone_number)
    c.id,
    d.quantidade,
    d.datas_cadastro
  FROM clients c
  INNER JOIN duplicates d ON c.phone_number = d.phone_number
  ORDER BY c.phone_number, c.created_at DESC
)
UPDATE clients c
SET 
  quantidade_cadastros = lc.quantidade,
  historico_cadastros = generate_registration_history(lc.datas_cadastro),
  updated_at = NOW()
FROM latest_client lc
WHERE c.id = lc.id;

-- Passo 3: Atualizar registros antigos (desativar e preservar telefone nas observações)
WITH duplicates AS (
  SELECT 
    phone_number,
    array_agg(id ORDER BY created_at DESC) as ids_ordenados
  FROM clients
  WHERE phone_number IS NOT NULL 
    AND phone_number != '' 
    AND phone_number != '00000000000'
  GROUP BY phone_number
  HAVING COUNT(*) > 1
),
old_clients AS (
  SELECT unnest(ids_ordenados[2:]) as id, d.phone_number as original_phone
  FROM duplicates d
)
UPDATE clients c
SET 
  observations = COALESCE(observations || E'\n\n', '') || 
                 '📱 Telefone original (cadastro duplicado): ' || oc.original_phone,
  phone_number = '00000000000',
  active = false,
  updated_at = NOW()
FROM old_clients oc
WHERE c.id = oc.id;