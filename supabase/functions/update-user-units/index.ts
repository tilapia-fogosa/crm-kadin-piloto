
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  console.log('Update user units function called')

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Initializing Supabase client')
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

    // Get request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { userId, unitIds, role } = requestBody

    // Validation with detailed logs
    console.log('Validating input data')
    if (!userId) throw new Error('ID do usuário é obrigatório')
    if (!role) throw new Error('Função é obrigatória')
    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      throw new Error('Pelo menos uma unidade deve ser selecionada')
    }

    // Update user units using the manage_user_units function
    console.log('Calling manage_user_units with params:', { creator_id: creator.id, userId, unitIds, role })
    const { data: unitData, error: unitError } = await supabaseAdmin.rpc(
      'manage_user_units',
      {
        p_creator_id: creator.id,
        p_user_id: userId,
        p_unit_ids: unitIds,
        p_role: role
      }
    )

    if (unitError) {
      console.error('Error in manage_user_units:', unitError)
      throw unitError
    }

    console.log('Operation completed successfully:', unitData)
    return new Response(
      JSON.stringify({ userId, success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorDetails = error instanceof Error && 'details' in error ? (error as { details?: string }).details : 'No additional details available';
    console.error('Error in update-user-units function:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
