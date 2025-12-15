
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ID do perfil Sistema-Kadin para registros automáticos
const SISTEMA_KADIN_ID = 'eaf94b92-7646-485f-bd96-016bf1add2b2'

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

/**
 * Gera entrada de histórico para cadastro duplicado
 */
function generateHistoryEntry(quantidade: number): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  return `• Se cadastrou pela ${quantidade}ª vez no dia ${dataAtual}`
}

/**
 * Atualiza contador e histórico de cadastro duplicado
 */
async function updateDuplicateRegistration(
  supabase: any,
  clientId: string,
  currentQuantidade: number | null,
  currentHistorico: string | null
): Promise<{ success: boolean; quantidade: number; historico: string }> {
  console.log('updateDuplicateRegistration: Atualizando cadastro duplicado para cliente:', clientId)
  
  // Calcular nova quantidade (incrementar)
  const novaQuantidade = (currentQuantidade || 1) + 1
  
  // Gerar nova entrada de histórico
  const novaEntrada = generateHistoryEntry(novaQuantidade)
  
  // Montar histórico atualizado
  let historicoAtualizado = currentHistorico || '📋 Histórico de cadastros:'
  historicoAtualizado += `\n${novaEntrada}`
  
  console.log('updateDuplicateRegistration: Nova quantidade:', novaQuantidade)
  console.log('updateDuplicateRegistration: Novo histórico:', historicoAtualizado)
  
  // Atualizar no banco de dados
  const { error } = await supabase
    .from('clients')
    .update({
      quantidade_cadastros: novaQuantidade,
      historico_cadastros: historicoAtualizado,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
  
  if (error) {
    console.error('updateDuplicateRegistration: Erro ao atualizar:', error)
    return {
      success: false,
      quantidade: currentQuantidade || 1,
      historico: currentHistorico || ''
    }
  }
  
  console.log('updateDuplicateRegistration: Atualização concluída com sucesso')
  
  return {
    success: true,
    quantidade: novaQuantidade,
    historico: historicoAtualizado
  }
}

serve(async (req) => {
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
    const payload: ClientPayload = await req.json()
    console.log('Payload recebido:', payload)

    // Validate required fields
    if (!payload.name || !payload.phone_number) {
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios ausentes',
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

    // ============================================
    // VERIFICAR SE JÁ EXISTE CLIENTE COM ESTE TELEFONE NA UNIDADE
    // ============================================
    console.log('Verificando duplicado para telefone:', payload.phone_number, 'na unidade:', unitId)
    
    const { data: existingClient, error: duplicateError } = await supabase
      .from('clients')
      .select('id, name, phone_number, status, quantidade_cadastros, historico_cadastros')
      .eq('phone_number', payload.phone_number)
      .eq('unit_id', unitId)
      .eq('active', true)
      .maybeSingle()
    
    if (duplicateError) {
      console.error('Erro ao verificar duplicado:', duplicateError)
    }
    
    // Se existe cliente, atualizar contador e retornar cliente existente
    if (existingClient) {
      console.log('Cliente existente encontrado:', existingClient)
      
      // Atualizar contador e histórico de cadastros
      const duplicateResult = await updateDuplicateRegistration(
        supabase,
        existingClient.id,
        existingClient.quantidade_cadastros,
        existingClient.historico_cadastros
      )
      
      console.log('Resultado da atualização de duplicado:', duplicateResult)
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cliente já existente atualizado',
          duplicate: true,
          client_id: existingClient.id,
          client_name: existingClient.name,
          quantidade_cadastros: duplicateResult.quantidade,
          unit_id: unitId
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // ============================================
    // CRIAR NOVO CLIENTE (não existe duplicado)
    // ============================================
    console.log('Nenhum duplicado encontrado, criando novo cliente')

    // Prepare client data for insertion
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
      quantidade_cadastros: 1,
      historico_cadastros: null
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

    // Registrar automaticamente no histórico comercial
    try {
      console.log('Inserindo registro automático no histórico comercial para client_id:', data.id)
      const { error: historyError } = await supabase
        .from('historico_comercial')
        .insert({
          client_id: data.id,
          mensagem: ' ',
          from_me: true,
          created_by: SISTEMA_KADIN_ID,
          lida: false,
          tipo_mensagem: 'sistema'
        })
      
      if (historyError) {
        console.error('Erro ao inserir histórico comercial:', historyError)
        // Não bloqueia o fluxo principal
      } else {
        console.log('Histórico comercial registrado com sucesso')
      }
    } catch (historyErr) {
      console.error('Exceção ao inserir histórico comercial:', historyErr)
      // Não bloqueia o fluxo principal
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cliente registrado com sucesso',
        duplicate: false,
        client_id: data.id,
        normalized_source: normalizedSource,
        unit_id: unitId
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao processar solicitação:', errorMessage)

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar solicitação',
        details: errorMessage
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
