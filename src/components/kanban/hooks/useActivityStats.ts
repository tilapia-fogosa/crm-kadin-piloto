
import { useCombinedActivityStats } from "./useCombinedActivityStats";

/**
 * DEPRECATED: Este hook foi substituído por versões mais especializadas.
 * Use useCombinedActivityStats no lugar deste.
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
  console.log("[ACTIVITY STATS] DEPRECATED: Este hook foi substituído. Use useCombinedActivityStats.");
  
  // Redireciona para o novo hook combinado
  return useCombinedActivityStats(
    selectedSource,
    selectedMonth,
    selectedYear,
    userUnits,
    selectedUnitId,
    isOpen
  );
}
