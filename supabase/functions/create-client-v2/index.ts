
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClientPayloadV2 extends ClientPayload {
  registration_cpf: string
  registration_name: string
}

interface ClientPayload {
  name: string
  phone_number: string
  unit_number: number
  email?: string
  lead_source?: string
  observations?: string
  meta_id?: string
  original_ad?: string
  original_adset?: string
  age_range?: string
}

serve(async (req) => {
  console.log('Received request to create-client-v2')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const payload: ClientPayloadV2 = await req.json()
    console.log('Payload recebido:', payload)

    // Check each required field individually and collect missing fields
    const missingFields = []
    
    if (!payload.name) missingFields.push('name')
    if (!payload.phone_number) missingFields.push('phone_number')
    if (!payload.registration_cpf) missingFields.push('registration_cpf')
    if (!payload.registration_name) missingFields.push('registration_name')
    if (!payload.unit_number) missingFields.push('unit_number')

    // If any required fields are missing, return error
    if (missingFields.length > 0) {
      console.log('Campos obrigatórios ausentes:', missingFields)
      return new Response(
        JSON.stringify({
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
          missing_fields: missingFields,
          received_payload: payload
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Normalize lead source by querying the lead_sources table
    let normalizedSource = 'outros' // Default value
    
    if (payload.lead_source) {
      const sourceLower = payload.lead_source.toLowerCase().trim()
      console.log('Buscando origens de leads para normalização:', sourceLower)
      
      // Fetch all lead sources from the database
      const { data: leadSources, error: sourcesError } = await supabase
        .from('lead_sources')
        .select('id, name')
      
      if (sourcesError) {
        console.error('Erro ao buscar origens de leads:', sourcesError)
      } else {
        console.log(`Encontradas ${leadSources.length} origens de leads para normalização`)
        
        // First check for direct match by ID
        const directMatch = leadSources.find(source => 
          source.id.toLowerCase() === sourceLower
        )
        
        // Then check for match by name
        const nameMatch = leadSources.find(source => 
          source.name.toLowerCase() === sourceLower
        )
        
        if (directMatch) {
          normalizedSource = directMatch.id
          console.log(`Origem encontrada por ID: ${normalizedSource}`)
        } else if (nameMatch) {
          normalizedSource = nameMatch.id
          console.log(`Origem encontrada por nome: ${normalizedSource}`)
        } else {
          console.log(`Nenhuma correspondência encontrada para '${sourceLower}', usando 'outros'`)
        }
      }
    }
    
    console.log('Lead source normalizado:', normalizedSource)

    // Find unit by unit_number
    console.log('Buscando unidade com número:', payload.unit_number)
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id')
      .eq('unit_number', payload.unit_number)
      .eq('active', true)
      .single()

    if (unitError || !unit) {
      console.log('Erro ao buscar unidade ou unidade não encontrada:', unitError)
      return new Response(
        JSON.stringify({
          error: `Unidade não encontrada com o número ${payload.unit_number}`,
          details: unitError?.message
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Unidade encontrada:', unit)

    // Prepare client data for insertion with new registration fields
    const clientData = {
      name: payload.name,
      phone_number: payload.phone_number,
      lead_source: normalizedSource,
      observations: payload.observations,
      created_by: null,
      status: 'novo-cadastro',
      meta_id: payload.meta_id,
      original_ad: payload.original_ad,
      original_adset: payload.original_adset,
      age_range: payload.age_range,
      unit_id: unit.id,
      email: payload.email,
      registration_cpf: payload.registration_cpf,
      registration_name: payload.registration_name
    }

    console.log('Tentando inserir cliente:', clientData)

    // Insert client
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir cliente:', error)
      throw error
    }

    console.log('Cliente criado com sucesso:', data)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cliente registrado com sucesso',
        normalized_source: normalizedSource,
        unit_id: unit.id
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro ao processar solicitação:', error)

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar solicitação',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
