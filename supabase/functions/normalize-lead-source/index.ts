
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

console.log("Normalize Lead Source Function initialized")

interface LeadPayload {
  name: string
  phone_number: string
  email?: string
  lead_source?: string
  observations?: string
  meta_id?: string
  original_ad?: string
  original_adset?: string
  age_range?: string
}

// Criação do cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Recebendo nova requisição POST')
    const payload = await req.json()
    console.log('Payload recebido:', payload)

    // Validar campos obrigatórios
    if (!payload.name) {
      console.error('Campo obrigatório ausente: name')
      return new Response(
        JSON.stringify({ 
          error: 'Campo obrigatório ausente: name',
          received_payload: payload 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (!payload.phone_number) {
      console.error('Campo obrigatório ausente: phone_number')
      return new Response(
        JSON.stringify({ 
          error: 'Campo obrigatório ausente: phone_number',
          received_payload: payload 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Log dos campos recebidos
    console.log('Campos recebidos:')
    console.log('name:', payload.name)
    console.log('phone_number:', payload.phone_number)
    console.log('email:', payload.email)
    console.log('lead_source:', payload.lead_source)
    console.log('observations:', payload.observations)
    console.log('meta_id:', payload.meta_id)
    console.log('original_ad:', payload.original_ad)
    console.log('original_adset:', payload.original_adset)
    console.log('age_range:', payload.age_range)

    // Buscar todas as origens de leads do banco de dados
    console.log('Buscando origens de leads no banco de dados')
    const { data: leadSources, error: sourcesError } = await supabase
      .from('lead_sources')
      .select('id, name')
    
    if (sourcesError) {
      console.error('Erro ao buscar origens de leads:', sourcesError)
      // Se falhar ao buscar as origens, usamos o mapeamento padrão
      console.log('Usando mapeamento padrão para origens de leads')
    }

    // Normalizar o lead source
    let normalizedSource = 'outros'
    if (payload.lead_source) {
      const sourceLower = payload.lead_source.toLowerCase().trim()
      
      // Verificar se a origem existe na tabela lead_sources
      if (leadSources && leadSources.length > 0) {
        // Procurar por correspondência direta pelo ID
        const directMatch = leadSources.find(source => 
          source.id.toLowerCase() === sourceLower
        )
        
        // Procurar por correspondência pelo nome
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
          // Tentar mapeamento para origens comuns
          const defaultMapping: Record<string, string> = {
            'fb': 'facebook',
            'ig': 'instagram',
            'website': 'website',
            'whatsapp': 'whatsapp',
            'webhook': 'webhook',
            'indicacao': 'indicacao',
            'franqueador': 'franqueador',
            'outros': 'outros'
          }
          normalizedSource = defaultMapping[sourceLower] || 'outros'
          console.log(`Origem mapeada usando valores padrão: ${normalizedSource}`)
        }
      } else {
        // Usar mapeamento estático caso não consiga acessar a tabela
        const staticMapping: Record<string, string> = {
          'fb': 'facebook',
          'ig': 'instagram',
          'website': 'website',
          'whatsapp': 'whatsapp',
          'webhook': 'webhook',
          'indicacao': 'indicacao',
          'franqueador': 'franqueador',
          'outros': 'outros'
        }
        normalizedSource = staticMapping[sourceLower] || 'outros'
        console.log(`Origem mapeada usando valores estáticos: ${normalizedSource}`)
      }
    }
    
    console.log('Lead source normalizado:', normalizedSource)

    // Criar o objeto de lead com todos os campos
    const lead = {
      name: payload.name,
      phone_number: payload.phone_number,
      email: payload.email,
      lead_source: normalizedSource,
      observations: payload.observations,
      meta_id: payload.meta_id,
      original_ad: payload.original_ad,
      original_adset: payload.original_adset,
      age_range: payload.age_range
    }

    console.log('Tentando inserir lead na tabela:', lead)

    // Criar cliente usando o service_role key para garantir inserção
    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(lead)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao inserir lead:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao inserir lead no banco de dados',
          details: error,
          attempted_payload: lead 
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Lead inserido com sucesso!')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Lead registrado com sucesso',
        normalized_source: normalizedSource 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar requisição',
        details: error.message,
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
