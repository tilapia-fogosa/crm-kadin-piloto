
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

console.log("Create Client Function initialized")

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
}

const leadSourceMapping: Record<string, string> = {
  'fb': 'facebook',
  'ig': 'instagram',
  'website': 'website',
  'whatsapp': 'whatsapp',
  'webhook': 'webhook',
  'indicacao': 'indicacao',
  'outros': 'outros'
}

// Função para verificar Basic Auth
async function checkBasicAuth(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  
  // Se não houver header de autorização, retorna falso
  if (!authHeader) return false
  
  // Verifica se é Basic Auth
  const match = authHeader.match(/^Basic (.+)$/)
  if (!match) return false

  try {
    const credentials = atob(match[1])
    const [username, password] = credentials.split(':')

    if (!username || !password) return false

    // Conectar ao banco usando a URL do banco
    const pool = new Pool(Deno.env.get('SUPABASE_DB_URL') ?? '', 1)
    
    try {
      const client = await pool.connect()
      try {
        console.log('Verificando credenciais para usuário:', username)
        
        const result = await client.queryObject<{ exists: boolean }>(
          `SELECT EXISTS (
            SELECT 1 
            FROM webhook_credentials 
            WHERE username = $1 
            AND password_hash = crypt($2, password_hash)
            AND active = true
          )`,
          [username, password]
        )
        
        const isValid = result.rows[0]?.exists ?? false
        console.log('Credenciais válidas:', isValid)
        
        return isValid
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Erro ao verificar credenciais:', error)
      return false
    } finally {
      await pool.end()
    }
  } catch (error) {
    console.error('Erro ao decodificar credenciais:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Recebendo nova requisição POST')
    
    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    const apiKey = req.headers.get('apikey')

    console.log('Auth Header recebido:', authHeader)
    
    // Primeiro tenta Basic Auth
    const isBasicAuthValid = await checkBasicAuth(req)
    
    // Se Basic Auth falhar, verifica se tem Bearer token válido
    const hasBearerToken = authHeader?.startsWith('Bearer ')
    const isValidBearerAuth = hasBearerToken && apiKey === Deno.env.get('SUPABASE_ANON_KEY')

    console.log('Resultado da autenticação:')
    console.log('- Basic Auth válido:', isBasicAuthValid)
    console.log('- Bearer token válido:', isValidBearerAuth)

    // Se ambas as autenticações falharem, retorna erro
    if (!isBasicAuthValid && !isValidBearerAuth) {
      console.error('Erro de autenticação - nenhum método válido')
      return new Response(
        JSON.stringify({ 
          error: 'Não autorizado',
          message: 'Credenciais inválidas'
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

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

    // Normalizar o lead source
    let normalizedSource = 'outros'
    if (payload.lead_source) {
      const sourceLower = payload.lead_source.toLowerCase().trim()
      normalizedSource = leadSourceMapping[sourceLower] || 'outros'
      console.log('Lead source normalizado:', normalizedSource)
    }

    // Criar o objeto do cliente com todos os campos
    const client = {
      name: payload.name,
      phone_number: payload.phone_number,
      lead_source: normalizedSource,
      observations: payload.observations,
      meta_id: payload.meta_id,
      original_ad: payload.original_ad,
      original_adset: payload.original_adset,
      age_range: payload.age_range,
      status: 'novo-cadastro'
    }

    console.log('Tentando inserir cliente:', client)

    // Criar cliente usando o service_role key
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(client)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao inserir cliente:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao inserir cliente no banco de dados',
          details: error 
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

    console.log('Cliente inserido com sucesso!')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cliente registrado com sucesso',
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
        details: error.message
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
