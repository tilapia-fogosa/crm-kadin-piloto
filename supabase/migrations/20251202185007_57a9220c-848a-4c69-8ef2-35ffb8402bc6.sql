-- Corrigir registros antigos: alterar telefone para 00000000000
-- (registros que já têm a observação de telefone duplicado mas ainda têm o telefone original)
UPDATE clients
SET 
  phone_number = '00000000000',
  updated_at = NOW()
WHERE observations LIKE '%Telefone original (cadastro duplicado)%'
  AND phone_number != '00000000000';