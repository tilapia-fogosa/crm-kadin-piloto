
import { useAggregatedActivityStats } from "./useAggregatedActivityStats";

/**
 * DEPRECATED: Este hook foi atualizado para utilizar a abordagem de agregação no banco.
 * Use useAggregatedActivityStats no lugar deste.
 * 
 * Este arquivo é mantido para compatibilidade com código existente.
 */
export function useActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.log("[ACTIVITY STATS] Usando versão otimizada com agregação no banco de dados");
  
  // Redireciona para o novo hook de agregação
  return useAggregatedActivityStats(
    selectedSource,
    selectedMonth,
    selectedYear,
    userUnits,
    selectedUnitId,
    isOpen
  );
}
