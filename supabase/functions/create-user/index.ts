
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Create user function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with Service Role
    console.log('Initializing Supabase client with service role')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get current user
    console.log('Getting current user from auth header')
    const { data: { user: creator }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !creator) {
      console.error('Error getting user:', userError)
      throw new Error('Unauthorized')
    }

    console.log('Current user:', creator.id)

    // Get request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { email, fullName, role, unitIds } = requestBody

    // Validation with detailed logs
    console.log('Validating input data')
    if (!email) throw new Error('Email é obrigatório')
    if (!fullName) throw new Error('Nome completo é obrigatório')
    if (!role) throw new Error('Função é obrigatória')
    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      throw new Error('Pelo menos uma unidade deve ser selecionada')
    }

    // Check if user already exists
    console.log('Checking if user exists:', email)
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users.find(u => u.email === email)

    let userId: string

    if (!userExists) {
      // Create new user
      console.log('Creating new user in auth.users')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'Mudar@123',
        user_metadata: { full_name: fullName }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      userId = newUser.user.id
      console.log('New user created:', userId)

      // Create user profile and unit associations
      console.log('Creating user profile and unit associations')
      const { data: profileData, error: profileError } = await supabaseAdmin.rpc(
        'create_new_unit_user',
        {
          p_creator_id: creator.id,
          p_user_id: userId,
          p_email: email,
          p_full_name: fullName,
          p_unit_ids: unitIds,
          p_role: role
        }
      )

      if (profileError) {
        console.error('Error in create_new_unit_user:', profileError)
        throw profileError
      }
    } else {
      // Update existing user
      userId = userExists.id
      console.log('Updating existing user:', userId)

      const { error: updateError } = await supabaseAdmin.rpc(
        'update_unit_user',
        {
          p_creator_id: creator.id,
          p_user_id: userId,
          p_full_name: fullName,
          p_unit_ids: unitIds,
          p_role: role
        }
      )

      if (updateError) {
        console.error('Error in update_unit_user:', updateError)
        throw updateError
      }
    }

    console.log('Operation completed successfully')
    return new Response(
      JSON.stringify({ userId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
