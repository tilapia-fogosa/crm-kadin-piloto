
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

type OperationType = 'rename-user' | 'deactivate-user' | 'merge-users'

interface RenameUserBody {
  operation: 'rename-user'
  oldEmail: string
  newEmail: string
  fullName?: string
}

interface DeactivateUserBody {
  operation: 'deactivate-user'
  email: string
}

interface MergeUsersBody {
  operation: 'merge-users'
  sourceEmail: string
  targetEmail: string
}

type RequestBody = RenameUserBody | DeactivateUserBody | MergeUsersBody

serve(async (req) => {
  console.log('Iniciando função manage-user-accounts')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Tratando requisição CORS preflight')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Inicializar Supabase client com Service Role
    console.log('Inicializando cliente Supabase')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização não fornecido')
    }

    // Verificar permissão do usuário atual (admin apenas)
    console.log('Verificando permissão do usuário atual')
    const { data: { user: requester }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !requester) {
      console.error('Erro ao obter usuário:', userError)
      throw new Error('Não autorizado')
    }

    // Verificar se o usuário é admin
    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin_user', {
      user_id: requester.id
    })

    if (!isAdmin) {
      console.error('Usuário não é admin')
      throw new Error('Não autorizado - Acesso de administrador necessário')
    }

    // Processar o corpo da requisição
    const body: RequestBody = await req.json()
    console.log('Corpo da requisição:', body)

    // Executar operação com base no tipo
    let result
    switch (body.operation) {
      case 'rename-user':
        result = await renameUser(supabaseAdmin, body)
        break
      case 'deactivate-user':
        result = await deactivateUser(supabaseAdmin, body)
        break
      case 'merge-users':
        result = await mergeUsers(supabaseAdmin, body)
        break
      default:
        throw new Error('Operação não suportada')
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na função manage-user-accounts:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

/**
 * Renomeia um usuário, atualizando seu email e opcionalmente o nome completo
 */
async function renameUser(supabase, body: RenameUserBody) {
  console.log(`Iniciando renomeação de usuário: ${body.oldEmail} -> ${body.newEmail}`)
  
  // 1. Verificar se o novo email já existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const newEmailExists = existingUsers.users.some(u => u.email === body.newEmail)
  
  if (newEmailExists) {
    throw new Error(`Novo email ${body.newEmail} já está em uso`)
  }

  // 2. Encontrar o usuário pelo email antigo
  const oldUser = existingUsers.users.find(u => u.email === body.oldEmail)
  
  if (!oldUser) {
    throw new Error(`Usuário com email ${body.oldEmail} não encontrado`)
  }

  console.log(`Usuário encontrado com ID: ${oldUser.id}`)

  // 3. Atualizar o email do usuário no auth.users
  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
    oldUser.id,
    { email: body.newEmail }
  )

  if (updateAuthError) {
    throw updateAuthError
  }

  // 4. Atualizar o perfil do usuário em profiles
  const updateData: { email: string; full_name?: string } = { email: body.newEmail }
  
  // Adicionar nome completo apenas se fornecido
  if (body.fullName) {
    updateData.full_name = body.fullName
  }

  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', oldUser.id)

  if (updateProfileError) {
    throw updateProfileError
  }

  return { message: `Usuário ${body.oldEmail} renomeado para ${body.newEmail} com sucesso` }
}

/**
 * Desativa um usuário no sistema, sem excluí-lo
 */
async function deactivateUser(supabase, body: DeactivateUserBody) {
  console.log(`Iniciando desativação de usuário: ${body.email}`)
  
  // 1. Encontrar o usuário pelo email
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const user = existingUsers.users.find(u => u.email === body.email)
  
  if (!user) {
    throw new Error(`Usuário com email ${body.email} não encontrado`)
  }

  console.log(`Usuário encontrado com ID: ${user.id}`)

  // 2. Desativar o acesso no perfil
  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      access_blocked: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateProfileError) {
    throw updateProfileError
  }

  // 3. Desativar todas as associações de unidade
  const { error: updateUnitUsersError } = await supabase
    .from('unit_users')
    .update({
      active: false
    })
    .eq('user_id', user.id)

  if (updateUnitUsersError) {
    throw updateUnitUsersError
  }

  return { message: `Usuário ${body.email} desativado com sucesso` }
}

/**
 * Mescla dois usuários, transferindo dados do usuário fonte para o usuário alvo
 * NOTA: Esta função é complexa e pode precisar de ajustes baseados na estrutura específica do banco de dados
 */
async function mergeUsers(supabase, body: MergeUsersBody) {
  console.log(`Iniciando mesclagem de usuários: ${body.sourceEmail} -> ${body.targetEmail}`)
  
  // 1. Encontrar ambos os usuários
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  
  const sourceUser = existingUsers.users.find(u => u.email === body.sourceEmail)
  if (!sourceUser) {
    throw new Error(`Usuário fonte com email ${body.sourceEmail} não encontrado`)
  }
  
  const targetUser = existingUsers.users.find(u => u.email === body.targetEmail)
  if (!targetUser) {
    throw new Error(`Usuário alvo com email ${body.targetEmail} não encontrado`)
  }

  console.log(`Usuário fonte ID: ${sourceUser.id}, Usuário alvo ID: ${targetUser.id}`)

  // 2. Transferir atividades de clientes
  const { error: updateActivitiesError } = await supabase
    .from('client_activities')
    .update({
      created_by: targetUser.id
    })
    .eq('created_by', sourceUser.id)

  if (updateActivitiesError) {
    throw updateActivitiesError
  }

  // 3. Transferir clientes
  const { error: updateClientsError } = await supabase
    .from('clients')
    .update({
      created_by: targetUser.id
    })
    .eq('created_by', sourceUser.id)

  if (updateClientsError) {
    throw updateClientsError
  }

  // 4. Desativar o usuário fonte
  await deactivateUser(supabase, { operation: 'deactivate-user', email: body.sourceEmail })

  return { 
    message: `Usuários mesclados com sucesso. Todas as atividades e clientes de ${body.sourceEmail} foram transferidos para ${body.targetEmail}.`
  }
}
