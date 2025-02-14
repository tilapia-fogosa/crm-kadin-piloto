
import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  try {
    const { method, userData } = await req.json();
    
    // Verificar autenticação e permissão
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o usuário é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || roles.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Permissão negada' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Criar usuário
    if (method === 'CREATE') {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'senha123',
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (error) throw error;

      // Inserir role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: userData.role
        });

      if (roleError) throw roleError;

      // Inserir unidades
      const { error: unitsError } = await supabase
        .from('unit_users')
        .insert(
          userData.units.map((unitId: string) => ({
            user_id: data.user.id,
            unit_id: unitId
          }))
        );

      if (unitsError) throw unitsError;

      return new Response(JSON.stringify({ data: data.user }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Atualizar usuário
    if (method === 'UPDATE') {
      // Atualizar profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: userData.full_name })
        .eq('id', userData.id);

      if (profileError) throw profileError;

      // Atualizar role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userData.id,
          role: userData.role
        });

      if (roleError) throw roleError;

      // Atualizar unidades
      const { error: deleteError } = await supabase
        .from('unit_users')
        .delete()
        .eq('user_id', userData.id);

      if (deleteError) throw deleteError;

      const { error: unitsError } = await supabase
        .from('unit_users')
        .insert(
          userData.units.map((unitId: string) => ({
            user_id: userData.id,
            unit_id: unitId
          }))
        );

      if (unitsError) throw unitsError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Método não suportado' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
