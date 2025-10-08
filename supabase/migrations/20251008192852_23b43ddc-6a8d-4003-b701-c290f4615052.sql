-- LOG: Corrigir fórmula atual para retroagir ao início de outubro
-- DESCRIÇÃO: Atualiza valid_from da fórmula ativa para cobrir todo o mês
UPDATE commission_formulas
SET valid_from = '2025-10-01'::DATE
WHERE id = '9e0fa2f7-4a4d-45f4-92a2-cebb92a31b35';

-- LOG: Resultado esperado: venda da Circera (02/10) será incluída no cálculo