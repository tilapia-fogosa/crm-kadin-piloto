-- Ativar RLS em todas as tabelas principais que têm políticas configuradas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_users ENABLE ROW LEVEL SECURITY;