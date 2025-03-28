
import { useQuery } from "@tanstack/react-query";
import { useUnit } from "@/contexts/UnitContext";
import { getUserStats } from "../services/userStatsService";
import { UserStats } from "../types/stats.types";

export { UserStats } from "../types/stats.types";

/**
 * Hook para obter estatísticas comerciais por usuário
 * @param selectedSource - Fonte selecionada para filtrar dados
 * @param selectedMonth - Mês selecionado para filtrar dados
 * @param selectedYear - Ano selecionado para filtrar dados
 * @param selectedUnitId - ID da unidade selecionada (opcional)
 * @returns Query com estatísticas de usuários
 */
export function useCommercialUserStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string | null
) {
  const { availableUnits } = useUnit();
  
  console.log('Iniciando busca de estatísticas por usuário:', {
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
    availableUnits
  });

  return useQuery({
    queryKey: ['commercial-user-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      // Definir datas para o período selecionado
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      // Obter array de IDs de unidades acessíveis
      const availableUnitIds = availableUnits.map(unit => unit.unit_id);
      
      // Se uma unidade específica foi selecionada, filtra apenas por ela
      const unitFilter = selectedUnitId 
        ? [selectedUnitId]
        : availableUnitIds;

      console.log('Buscando estatísticas por usuário:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        unitFilter
      });

      // Buscar e processar estatísticas de usuários
      return getUserStats(startDate, endDate, unitFilter, selectedSource);
    },
  });
}
