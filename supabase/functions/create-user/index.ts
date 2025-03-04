
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
    console.log('Initializing Supabase client')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log request body for debugging
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { email, fullName, role, unitIds } = requestBody

    // Validação detalhada com logs
    console.log('Validating input data')
    if (!email) {
      throw new Error('Email é obrigatório')
    }
    if (!fullName) {
      throw new Error('Nome completo é obrigatório')
    }
    if (!role) {
      throw new Error('Função é obrigatória')
    }
    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      throw new Error('Pelo menos uma unidade deve ser selecionada')
    }

    console.log('Calling create_unit_user RPC')
    const { data: userId, error: createError } = await supabaseClient.rpc(
      'create_unit_user',
      {
        p_email: email,
        p_full_name: fullName,
        p_unit_ids: unitIds,
        p_role: role
      }
    )

    if (createError) {
      console.error('Error in create_unit_user RPC:', createError)
      throw createError
    }

    console.log('User created successfully:', userId)

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
