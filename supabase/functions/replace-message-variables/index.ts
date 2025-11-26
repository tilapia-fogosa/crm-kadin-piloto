/**
 * Edge Function: replace-message-variables
 * 
 * Log: Substitui variáveis dinâmicas em mensagens com dados reais do cliente e unidade
 * 
 * Variáveis suportadas:
 * - {{nome}} -> clients.name
 * - {{primeiro_nome}} -> clients.primeiro_nome
 * - {{telefone}} -> clients.phone_number
 * - {{email}} -> clients.email
 * - {{origem}} -> clients.lead_source
 * - {{dia_agendamento}} -> Data do agendamento (dd/MM/yyyy)
 * - {{horario_agendamento}} -> Horário do agendamento (HH:mm)
 * - {{unidade}} -> units.name
 * - {{endereco}} -> Concatenação de units: street, number, complement, neighborhood, postal_code
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

console.log("Replace Message Variables Edge Function initialized");

// Criação do cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Formata endereço completo a partir dos campos da unidade
 * Log: Concatena campos de endereço da unidade
 */
function formatAddress(unit: any): string {
  console.log('formatAddress: Formatando endereço da unidade', unit.id);
  
  const parts: string[] = [];
  
  if (unit.street) parts.push(unit.street);
  if (unit.number) parts.push(unit.number);
  if (unit.complement) parts.push(`- ${unit.complement}`);
  if (unit.neighborhood) parts.push(unit.neighborhood);
  if (unit.postal_code) parts.push(`- ${unit.postal_code}`);
  
  const address = parts.join(', ');
  console.log('formatAddress: Endereço formatado:', address);
  
  return address || 'Não informado';
}

/**
 * Formata apenas a data (dia/mês/ano) no fuso horário de São Paulo
 * Log: Converte data ISO para dd/MM/yyyy usando America/Sao_Paulo
 */
function formatDateOnly(dateString: string | null): string {
  if (!dateString) return 'Não informado';
  
  try {
    const date = new Date(dateString);
    
    // Formatar usando fuso horário de São Paulo
    const formatted = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    console.log(`formatDateOnly: ${dateString} -> ${formatted}`);
    return formatted;
  } catch (error) {
    console.error('formatDateOnly: Erro ao formatar data:', error);
    return 'Não informado';
  }
}

/**
 * Formata apenas o horário (hora:minuto) no fuso horário de São Paulo
 * Log: Converte data ISO para HH:mm usando America/Sao_Paulo
 */
function formatTimeOnly(dateString: string | null): string {
  if (!dateString) return 'Não informado';
  
  try {
    const date = new Date(dateString);
    
    // Formatar usando fuso horário de São Paulo
    const formatted = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    console.log(`formatTimeOnly: ${dateString} -> ${formatted}`);
    return formatted;
  } catch (error) {
    console.error('formatTimeOnly: Erro ao formatar horário:', error);
    return 'Não informado';
  }
}

/**
 * Substitui variáveis em uma mensagem
 * Log: Processa todas as variáveis {{xxx}} na mensagem
 */
async function replaceVariables(message: string, clientId: string): Promise<string> {
  console.log('replaceVariables: Iniciando substituição para cliente', clientId);
  console.log('replaceVariables: Mensagem original:', message);
  
  // Buscar dados do cliente com a unidade
  console.log('replaceVariables: Buscando dados do cliente e unidade');
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select(`
      *,
      unit:units!clients_unit_id_fkey (
        id,
        name,
        street,
        number,
        complement,
        neighborhood,
        postal_code,
        city,
        state
      )
    `)
    .eq('id', clientId)
    .single();
  
  if (clientError || !client) {
    console.error('replaceVariables: Erro ao buscar cliente:', clientError);
    throw new Error('Cliente não encontrado');
  }
  
  console.log('replaceVariables: Cliente encontrado:', client.name);
  console.log('replaceVariables: Unidade:', client.unit?.name);
  
  // Mapa de substituições
  const replacements: Record<string, string> = {
    '{{nome}}': client.name || 'Não informado',
    '{{primeiro_nome}}': client.primeiro_nome || client.name?.split(' ')[0] || 'Não informado',
    '{{telefone}}': client.phone_number || 'Não informado',
    '{{email}}': client.email || 'Não informado',
    '{{origem}}': client.lead_source || 'Não informado',
    '{{dia_agendamento}}': formatDateOnly(client.scheduled_date),
    '{{horario_agendamento}}': formatTimeOnly(client.scheduled_date),
    '{{unidade}}': client.unit?.name || 'Não informado',
    '{{endereco}}': client.unit ? formatAddress(client.unit) : 'Não informado',
  };
  
  console.log('replaceVariables: Mapa de substituições criado');
  
  // Substituir todas as variáveis
  let processedMessage = message;
  
  for (const [variable, value] of Object.entries(replacements)) {
    // Usar regex global para substituir todas as ocorrências
    const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g');
    const beforeCount = (processedMessage.match(regex) || []).length;
    
    if (beforeCount > 0) {
      processedMessage = processedMessage.replace(regex, value);
      console.log(`replaceVariables: Substituiu ${beforeCount}x ${variable} por "${value}"`);
    }
  }
  
  console.log('replaceVariables: Mensagem processada:', processedMessage);
  
  return processedMessage;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Edge Function: Requisição recebida');
    
    const { message, clientId } = await req.json();
    
    // Validar parâmetros
    if (!message || typeof message !== 'string') {
      console.error('Edge Function: Mensagem inválida ou ausente');
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!clientId || typeof clientId !== 'string') {
      console.error('Edge Function: Client ID inválido ou ausente');
      return new Response(
        JSON.stringify({ error: 'Client ID é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Edge Function: Processando mensagem para cliente:', clientId);
    
    // Substituir variáveis
    const processedMessage = await replaceVariables(message, clientId);
    
    console.log('Edge Function: Substituição concluída com sucesso');
    
    return new Response(
      JSON.stringify({
        success: true,
        original: message,
        processed: processedMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Edge Function: Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar mensagem',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
