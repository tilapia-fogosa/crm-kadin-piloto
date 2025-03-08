
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
  email?: string
  lead_source?: string
  observations?: string
  meta_id?: string
  original_ad?: string
  original_adset?: string
  age_range?: string
  unit_number?: number
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

    // Validate required fields
    if (!payload.name || !payload.phone_number || !payload.registration_cpf || !payload.registration_name) {
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios ausentes',
          required_fields: ['name', 'phone_number', 'registration_cpf', 'registration_name'],
          received_payload: payload
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Normalize lead source
    const normalizedSource = normalizeLead(payload.lead_source)
    console.log('Lead source normalizado:', normalizedSource)

    // Try to find unit by unit_number if provided
    let unitId = '0df79a04-444e-46ee-b218-59e4b1835f4a' // Default unit ID
    if (payload.unit_number) {
      console.log('Buscando unidade com número:', payload.unit_number)
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('id')
        .eq('unit_number', payload.unit_number)
        .eq('active', true)
        .single()

      if (unitError) {
        console.log('Erro ao buscar unidade:', unitError)
      } else if (unit) {
        console.log('Unidade encontrada:', unit)
        unitId = unit.id
      } else {
        console.log('Nenhuma unidade encontrada com número', payload.unit_number, 'usando unidade padrão')
      }
    }

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
      unit_id: unitId,
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
        unit_id: unitId
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

function normalizeLead(source?: string): string {
  if (!source) return 'outros'
  
  const normalized = source.toLowerCase().trim()
  
  switch (normalized) {
    case 'fb':
      return 'facebook'
    case 'ig':
      return 'instagram'
    case 'website':
    case 'whatsapp':
    case 'webhook':
    case 'indicacao':
      return normalized
    default:
      return 'outros'
  }
}
