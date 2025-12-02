/**
 * Hook para verificar se já existe um cliente com o mesmo telefone
 * Utilizado para evitar duplicatas no cadastro de leads
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneForStorage } from '@/utils/phone-utils';

export interface ExistingClient {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  lead_source: string;
  status: string;
  created_at: string;
}

/**
 * Hook que verifica duplicidade de cliente por telefone e unidade
 * @returns checkDuplicate - função para verificar duplicados
 * @returns isChecking - estado de carregamento
 */
export const useCheckDuplicateClient = () => {
  const [isChecking, setIsChecking] = useState(false);
  
  /**
   * Verifica se existe cliente com mesmo telefone na mesma unidade
   * @param phoneNumber - Telefone a ser verificado (qualquer formato)
   * @param unitId - ID da unidade
   * @returns Cliente existente ou null
   */
  const checkDuplicate = async (
    phoneNumber: string, 
    unitId: string
  ): Promise<ExistingClient | null> => {
    setIsChecking(true);
    
    try {
      // Etapa 1: Formata o telefone para o padrão de armazenamento
      const formattedPhone = formatPhoneForStorage(phoneNumber);
      
      // Etapa 2: Log para debug
      console.log('useCheckDuplicateClient: Verificando duplicado:', { 
        original: phoneNumber, 
        formatted: formattedPhone, 
        unitId 
      });
      
      // Etapa 3: Busca cliente existente com mesmo telefone na mesma unidade
      // Verifica tanto o formato original quanto o formatado
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone_number, email, lead_source, status, created_at')
        .eq('unit_id', unitId)
        .eq('active', true)
        .or(`phone_number.eq.${formattedPhone},phone_number.eq.${phoneNumber}`)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('useCheckDuplicateClient: Erro ao verificar duplicado:', error);
        return null;
      }
      
      if (data) {
        console.log('useCheckDuplicateClient: Cliente duplicado encontrado:', data);
      } else {
        console.log('useCheckDuplicateClient: Nenhum duplicado encontrado');
      }
      
      return data;
    } finally {
      setIsChecking(false);
    }
  };
  
  return { checkDuplicate, isChecking };
};
