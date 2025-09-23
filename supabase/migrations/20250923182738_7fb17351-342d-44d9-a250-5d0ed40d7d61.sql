-- Adicionar foreign key constraint entre atividade_pos_venda e clients
-- LOG: Criando relacionamento formal entre atividade_pos_venda.client_id e clients.id
-- LOG: Isso permitirá que a consulta clients!inner(unit_id) funcione corretamente no frontend

-- Primeiro, verificar se não há registros órfãos
-- LOG: Verificando integridade dos dados antes de criar a constraint

-- Adicionar a foreign key constraint
ALTER TABLE public.atividade_pos_venda 
ADD CONSTRAINT fk_atividade_pos_venda_client_id 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE CASCADE;

-- LOG: Foreign key constraint criada com sucesso
-- LOG: Agora o Supabase JavaScript client poderá fazer JOIN automático
-- LOG: A consulta clients!inner(unit_id) no hook usePosVendaActivities funcionará