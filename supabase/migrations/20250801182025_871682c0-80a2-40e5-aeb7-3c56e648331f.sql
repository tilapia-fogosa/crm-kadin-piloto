-- Remover o trigger que está bloqueando as operações
DROP TRIGGER IF EXISTS client_activities_webhook_trigger ON client_activities;