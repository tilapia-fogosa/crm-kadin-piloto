
import { useState } from 'react';
import { useUnit } from '@/contexts/UnitContext';
import { useCommercialStats } from '@/hooks/useCommercialStats';

export function useFilteredCommercialStats(month: string, year: string) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const { availableUnits, isLoading: isLoadingUnits } = useUnit();
  
  console.log('Selected unit ID:', selectedUnitId);

  const { unitStats, userStats, sourceStats, isLoading: isLoadingStats } = useCommercialStats(
    month, 
    year, 
    selectedUnitId !== 'all' ? selectedUnitId : null
  );

  return {
    unitStats: unitStats || [],
    userStats: userStats || [],
    sourceStats: sourceStats || [],
    isLoading: isLoadingStats || isLoadingUnits,
    selectedUnitId,
    setSelectedUnitId,
    availableUnits
  };
}
