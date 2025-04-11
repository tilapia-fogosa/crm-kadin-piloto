
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

console.log("Evolution API Edge Function initialized")

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
    const url = new URL(req.url)
    const path = url.pathname

    // Basic auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('EVOLUTION_API_KEY')}`) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: { ...corsHeaders }
      })
    }

    // Route handling
    if (path === '/send-message' && req.method === 'POST') {
      const { phoneNumber, message } = await req.json()
      
      // Normalizar lead source antes de enviar a mensagem
      if (message && message.lead_source) {
        try {
          // Buscar todas as origens de leads do banco de dados
          console.log('Buscando origens de leads no banco de dados')
          const { data: leadSources, error: sourcesError } = await supabase
            .from('lead_sources')
            .select('id, name')
          
          if (sourcesError) {
            console.error('Erro ao buscar origens de leads:', sourcesError)
          } else {
            console.log(`Encontradas ${leadSources.length} origens de leads`)
            
            // Verificar se a origem existe na tabela lead_sources
            const sourceLower = message.lead_source.toLowerCase().trim()
            
            // Procurar por correspondência direta pelo ID
            const directMatch = leadSources.find(source => 
              source.id.toLowerCase() === sourceLower
            )
            
            // Procurar por correspondência pelo nome
            const nameMatch = leadSources.find(source => 
              source.name.toLowerCase() === sourceLower
            )
            
            if (directMatch) {
              message.lead_source = directMatch.id
              console.log(`Origem encontrada por ID: ${message.lead_source}`)
            } else if (nameMatch) {
              message.lead_source = nameMatch.id
              console.log(`Origem encontrada por nome: ${message.lead_source}`)
            }
          }
          
        } catch (error) {
          console.error('Erro ao normalizar a origem do lead:', error)
        }
      }

      // Here we'll implement the WhatsApp message sending logic
      // For now, we'll just log the attempt
      console.log(`Attempting to send message to ${phoneNumber}:`, JSON.stringify(message))

      return new Response(JSON.stringify({
        success: true,
        message: 'Message queued for delivery',
        normalized_source: message.lead_source
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      })
    }

    return new Response('Not Found', { 
      status: 404,
      headers: { ...corsHeaders }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
