-- Primeiro dropar a view existente e recriar com os novos campos
-- Necessário porque CREATE OR REPLACE não permite adicionar colunas no meio

DROP VIEW IF EXISTS kanban_client_summary;

CREATE VIEW kanban_client_summary AS
SELECT 
    c.id,
    c.name,
    c.phone_number,
    c.email,
    c.lead_source,
    c.status,
    c.next_contact_date,
    c.scheduled_date,
    c.unit_id,
    c.valorization_confirmed,
    c.registration_name,
    c.original_ad,
    c.original_adset,
    c.observations,
    c.created_at,
    u.name AS unit_name,
    ( SELECT json_build_object(
        'id', a.id, 
        'tipo_atividade', a.tipo_atividade, 
        'tipo_contato', a.tipo_contato, 
        'notes', a.notes, 
        'created_at', a.created_at, 
        'next_contact_date', a.next_contact_date, 
        'created_by', a.created_by
      ) AS json_build_object
      FROM client_activities a
      WHERE a.client_id = c.id AND a.active = true
      ORDER BY a.created_at DESC
      LIMIT 1
    ) AS last_activity,
    c.quantidade_cadastros,
    c.historico_cadastros
FROM clients c
LEFT JOIN units u ON c.unit_id = u.id
WHERE c.active = true
ORDER BY c.created_at DESC;