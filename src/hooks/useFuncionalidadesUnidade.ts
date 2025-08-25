import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";
import { useMemo } from "react";

// Tipos das funcionalidades baseados no ENUM do backend
export type TipoFuncionalidade = 
  | 'assistente_whatsapp'
  | 'google_agenda'
  | 'relatorios_avancados'
  | 'integracao_telefonia_net2phone';

// Interface para a funcionalidade
export interface FuncionalidadeUnidade {
  id: string;
  unit_id: string;
  tipo_funcionalidade: TipoFuncionalidade;
  ativa: boolean;
  configuracao: Record<string, any>;
  usuario_habilitou?: string;
  data_habilitacao?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para gerenciar funcionalidades da unidade atual
 * Log: Implementação do sistema de funcionalidades por unidade
 */
export function useFuncionalidadesUnidade() {
  const { selectedUnitId } = useUnit();

  // Buscar funcionalidades da unidade atual
  const { data: funcionalidades, isLoading, error, refetch } = useQuery({
    queryKey: ['funcionalidades-unidade', selectedUnitId],
    queryFn: async () => {
      console.log('Buscando funcionalidades da unidade:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.log('Nenhuma unidade selecionada');
        return [];
      }

      const { data, error } = await supabase
        .from('funcionalidades_unidade')
        .select('*')
        .eq('unit_id', selectedUnitId)
        .eq('ativa', true); // Somente funcionalidades ativas

      if (error) {
        console.error('Erro ao buscar funcionalidades da unidade:', error);
        throw error;
      }

      console.log('Funcionalidades encontradas:', data);
      return data as FuncionalidadeUnidade[];
    },
    enabled: !!selectedUnitId, // Só executa se tiver unidade selecionada
  });

  // Memoizar funcionalidades ativas para performance
  const funcionalidadesAtivas = useMemo(() => {
    if (!funcionalidades) return new Set<TipoFuncionalidade>();
    
    const ativas = new Set<TipoFuncionalidade>();
    funcionalidades.forEach(func => {
      if (func.ativa) {
        ativas.add(func.tipo_funcionalidade);
      }
    });
    
    console.log('Funcionalidades ativas memoizadas:', Array.from(ativas));
    return ativas;
  }, [funcionalidades]);

  // Verificar se uma funcionalidade específica está habilitada
  const temFuncionalidade = (tipo: TipoFuncionalidade): boolean => {
    const resultado = funcionalidadesAtivas.has(tipo);
    console.log(`Verificando funcionalidade '${tipo}':`, resultado);
    return resultado;
  };

  // Obter configuração de uma funcionalidade específica
  const obterConfiguracao = (tipo: TipoFuncionalidade): Record<string, any> => {
    if (!funcionalidades) {
      console.log(`Nenhuma funcionalidade carregada para obter configuração de '${tipo}'`);
      return {};
    }
    
    const funcionalidade = funcionalidades.find(
      func => func.tipo_funcionalidade === tipo && func.ativa
    );
    
    const config = funcionalidade?.configuracao || {};
    console.log(`Configuração da funcionalidade '${tipo}':`, config);
    return config;
  };

  // Verificar múltiplas funcionalidades de uma vez
  const temTodasFuncionalidades = (tipos: TipoFuncionalidade[]): boolean => {
    const resultado = tipos.every(tipo => funcionalidadesAtivas.has(tipo));
    console.log(`Verificando todas as funcionalidades ${tipos.join(', ')}:`, resultado);
    return resultado;
  };

  // Verificar se tem pelo menos uma funcionalidade de uma lista
  const temAlgumaFuncionalidade = (tipos: TipoFuncionalidade[]): boolean => {
    const resultado = tipos.some(tipo => funcionalidadesAtivas.has(tipo));
    console.log(`Verificando alguma funcionalidade ${tipos.join(', ')}:`, resultado);
    return resultado;
  };

  return {
    // Dados
    funcionalidades: funcionalidades || [],
    funcionalidadesAtivas,
    
    // Estados
    isLoading,
    error,
    
    // Métodos de verificação
    temFuncionalidade,
    obterConfiguracao,
    temTodasFuncionalidades,
    temAlgumaFuncionalidade,
    
    // Utilitários
    refetch,
    unitId: selectedUnitId,
  };
}