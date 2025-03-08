
import { useState } from 'react';
import { useUnit } from '@/contexts/UnitContext';
import { useCommercialStats } from '@/hooks/useCommercialStats';

export function useFilteredCommercialStats(month: string, year: string) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const { availableUnits, isLoading: isLoadingUnits } = useUnit();
  const { unitStats, userStats, sourceStats, isLoading: isLoadingStats } = useCommercialStats(month, year);

  console.log('Selected Unit ID:', selectedUnitId);
  console.log('Available Units:', availableUnits);

  const filteredUnitStats = selectedUnitId && selectedUnitId !== 'all'
    ? unitStats.filter(stat => stat.id === selectedUnitId)
    : unitStats.filter(stat => 
        availableUnits.some(unit => unit.unit_id === stat.id)
      );

  const filteredUserStats = selectedUnitId && selectedUnitId !== 'all'
    ? userStats.filter(stat => availableUnits.some(unit => 
        unit.unit_id === selectedUnitId && 
        stat.id === unit.unit_id
      ))
    : userStats.filter(stat =>
        availableUnits.some(unit => stat.id === unit.unit_id)
      );

  const filteredSourceStats = selectedUnitId && selectedUnitId !== 'all'
    ? sourceStats.filter(stat => stat.id === selectedUnitId)
    : sourceStats;

  return {
    unitStats: filteredUnitStats,
    userStats: filteredUserStats,
    sourceStats: filteredSourceStats,
    isLoading: isLoadingStats || isLoadingUnits,
    selectedUnitId,
    setSelectedUnitId,
    availableUnits
  };
}
