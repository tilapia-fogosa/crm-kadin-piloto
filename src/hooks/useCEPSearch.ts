/**
 * LOG: Hook customizado para busca de endereço via CEP
 * Utiliza a API pública ViaCEP (https://viacep.com.br/)
 */
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Interface de resposta da API ViaCEP
 */
interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Hook para busca de endereço através do CEP
 * 
 * @returns {Object} Objeto contendo:
 *   - fetchAddressByCEP: Função para buscar endereço por CEP
 *   - isLoadingCEP: Estado de loading da busca
 */
export function useCEPSearch() {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const { toast } = useToast();

  /**
   * LOG: Função para buscar endereço através do CEP
   * 
   * @param cep - CEP no formato 00000-000 ou 00000000
   * @returns Dados do endereço ou null em caso de erro
   */
  const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
    console.log('LOG: Iniciando busca de CEP:', cep);
    setIsLoadingCEP(true);

    try {
      // Limpar CEP (remover caracteres não numéricos)
      const cleanCEP = cep.replace(/\D/g, '');
      
      // Validar tamanho do CEP (deve ter 8 dígitos)
      if (cleanCEP.length !== 8) {
        console.warn('LOG: CEP inválido - deve conter 8 dígitos:', cleanCEP);
        throw new Error('CEP deve conter 8 dígitos');
      }

      console.log('LOG: CEP limpo:', cleanCEP);

      // Fazer requisição para API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        console.error('LOG: Erro na resposta da API ViaCEP:', response.status);
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      // Verificar se CEP foi encontrado
      if (data.erro) {
        console.warn('LOG: CEP não encontrado na base ViaCEP:', cleanCEP);
        throw new Error('CEP não encontrado');
      }

      console.log('LOG: Endereço encontrado com sucesso:', data);

      // Exibir toast de sucesso
      toast({
        title: "CEP encontrado!",
        description: "Endereço preenchido automaticamente.",
      });

      return data;

    } catch (error: any) {
      console.error('LOG: Erro ao buscar CEP:', error);

      // Exibir toast de erro
      toast({
        title: "Erro ao buscar CEP",
        description: error.message || "Não foi possível buscar o endereço. Verifique o CEP e tente novamente.",
        variant: "destructive",
      });

      return null;

    } finally {
      setIsLoadingCEP(false);
      console.log('LOG: Busca de CEP finalizada');
    }
  };

  return {
    fetchAddressByCEP,
    isLoadingCEP
  };
}
