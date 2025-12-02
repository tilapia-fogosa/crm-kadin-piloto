/**
 * Utilitário para rastreamento de cadastros duplicados
 * 
 * Log: Funções para atualizar contador e histórico quando um cliente
 * tenta se cadastrar novamente com o mesmo telefone
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Gera o texto de histórico para um novo cadastro duplicado
 * @param quantidade - Número atual de cadastros (será incrementado)
 * @returns Texto formatado para adicionar ao histórico
 */
export function generateHistoryEntry(quantidade: number): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  return `• Se cadastrou pela ${quantidade}ª vez no dia ${dataAtual}`;
}

/**
 * Atualiza o contador e histórico de cadastros duplicados
 * @param clientId - ID do cliente existente
 * @param currentQuantidade - Quantidade atual de cadastros
 * @param currentHistorico - Histórico atual (pode ser null)
 * @returns Objeto com novos valores de quantidade e histórico
 */
export async function updateDuplicateRegistration(
  clientId: string,
  currentQuantidade: number | null,
  currentHistorico: string | null
): Promise<{ success: boolean; quantidade: number; historico: string }> {
  console.log('updateDuplicateRegistration: Atualizando cadastro duplicado para cliente:', clientId);
  
  // Calcular nova quantidade (incrementar)
  const novaQuantidade = (currentQuantidade || 1) + 1;
  
  // Gerar nova entrada de histórico
  const novaEntrada = generateHistoryEntry(novaQuantidade);
  
  // Montar histórico atualizado
  let historicoAtualizado = currentHistorico || '📋 Histórico de cadastros:';
  historicoAtualizado += `\n${novaEntrada}`;
  
  console.log('updateDuplicateRegistration: Nova quantidade:', novaQuantidade);
  console.log('updateDuplicateRegistration: Novo histórico:', historicoAtualizado);
  
  // Atualizar no banco de dados
  const { error } = await supabase
    .from('clients')
    .update({
      quantidade_cadastros: novaQuantidade,
      historico_cadastros: historicoAtualizado,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);
  
  if (error) {
    console.error('updateDuplicateRegistration: Erro ao atualizar:', error);
    return {
      success: false,
      quantidade: currentQuantidade || 1,
      historico: currentHistorico || ''
    };
  }
  
  console.log('updateDuplicateRegistration: Atualização concluída com sucesso');
  
  return {
    success: true,
    quantidade: novaQuantidade,
    historico: historicoAtualizado
  };
}

/**
 * Busca dados de cadastro duplicado de um cliente
 * @param clientId - ID do cliente
 * @returns Dados de quantidade e histórico
 */
export async function getDuplicateRegistrationData(clientId: string): Promise<{
  quantidade_cadastros: number;
  historico_cadastros: string | null;
} | null> {
  console.log('getDuplicateRegistrationData: Buscando dados para cliente:', clientId);
  
  const { data, error } = await supabase
    .from('clients')
    .select('quantidade_cadastros, historico_cadastros')
    .eq('id', clientId)
    .single();
  
  if (error) {
    console.error('getDuplicateRegistrationData: Erro ao buscar:', error);
    return null;
  }
  
  console.log('getDuplicateRegistrationData: Dados encontrados:', data);
  
  return {
    quantidade_cadastros: data.quantidade_cadastros || 1,
    historico_cadastros: data.historico_cadastros
  };
}
