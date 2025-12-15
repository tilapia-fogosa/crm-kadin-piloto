
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

console.log("Evolution API Edge Function initialized")

// Criação do cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeamento de abreviações comuns para fontes completas
const commonAbbreviations: Record<string, string> = {
  'fb': 'facebook',
  'ig': 'instagram',
  'insta': 'instagram',
  'face': 'facebook',
  'wpp': 'whatsapp',
  'zap': 'whatsapp',
  'whats': 'whatsapp',
  'tt': 'tiktok',
  'tiktok': 'tiktok',
  'yt': 'youtube',
  'youtube': 'youtube',
  'tw': 'twitter',
  'twitter': 'twitter',
  'google': 'google',
  'ggl': 'google',
  'site': 'site',
  'web': 'site',
  'email': 'email',
  'mail': 'email',
  'linkedn': 'linkedin',
  'lkdn': 'linkedin',
  'in': 'linkedin'
}

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
          console.log('Lead source original:', message.lead_source)
          
          // ETAPA 1: Pré-processamento - transformar a fonte para minúsculo e remover espaços extras
          let sourceLower = message.lead_source.toLowerCase().trim()
          console.log('Lead source após normalização inicial:', sourceLower)
          
          // ETAPA 2: Verificar se é uma abreviação conhecida e substituir
          if (sourceLower in commonAbbreviations) {
            const originalSource = sourceLower
            sourceLower = commonAbbreviations[sourceLower]
            console.log(`Abreviação detectada: "${originalSource}" convertida para "${sourceLower}"`)
          }
          
          // ETAPA 3: Buscar todas as origens de leads do banco de dados
          console.log('Buscando origens de leads no banco de dados')
          const { data: leadSources, error: sourcesError } = await supabase
            .from('lead_sources')
            .select('id, name')
          
          if (sourcesError) {
            console.error('Erro ao buscar origens de leads:', sourcesError)
          } else {
            console.log(`Encontradas ${leadSources.length} origens de leads`)
            
            // Imprimir algumas origens para debugging
            if (leadSources.length < 20) {
              console.log('Origens disponíveis:')
              leadSources.forEach(source => {
                console.log(`- ID: "${source.id}", Nome: "${source.name}"`)
              })
            }
            
            // ETAPA 4: Verificar se a origem existe na tabela lead_sources
            
            // Procurar por correspondência direta pelo ID (case insensitive)
            const directMatch = leadSources.find(source => 
              source.id.toLowerCase() === sourceLower
            )
            
            // Procurar por correspondência pelo nome (case insensitive)
            const nameMatch = leadSources.find(source => 
              source.name.toLowerCase() === sourceLower
            )
            
            if (directMatch) {
              message.lead_source = directMatch.id
              console.log(`✅ Origem encontrada por ID: "${message.lead_source}"`)
            } else if (nameMatch) {
              message.lead_source = nameMatch.id
              console.log(`✅ Origem encontrada por nome: "${message.lead_source}"`)
            } else {
              console.log(`❌ Nenhuma correspondência encontrada para '${sourceLower}', mantendo valor original`)
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
