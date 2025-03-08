
import { useState } from 'react';
import { useUnit } from '@/contexts/UnitContext';
import { useCommercialStats } from '@/hooks/useCommercialStats';

export function useFilteredCommercialStats(month: string, year: string) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const { availableUnits, isLoading: isLoadingUnits } = useUnit();
  const { unitStats, userStats, sourceStats, isLoading: isLoadingStats } = useCommercialStats(month, year, selectedUnitId);

  console.log('Filtering stats for unit:', selectedUnitId);
  
  return {
    unitStats,
    userStats,
    sourceStats,
    isLoading: isLoadingStats || isLoadingUnits,
    selectedUnitId,
    setSelectedUnitId,
    availableUnits
  };
}
