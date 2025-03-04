
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserUnit } from '@/components/kanban/hooks/useUserUnit';

interface UnitContextType {
  selectedUnitId: string | null;
  setSelectedUnitId: (unitId: string | null) => void;
  availableUnits: { unit_id: string; units: { id: string; name: string; } }[];
  isLoading: boolean;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const { data: userUnits, isLoading } = useUserUnit();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Set first available unit as default when units are loaded
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && !selectedUnitId) {
      setSelectedUnitId(userUnits[0].unit_id);
    }
  }, [userUnits, selectedUnitId]);

  return (
    <UnitContext.Provider value={{
      selectedUnitId,
      setSelectedUnitId,
      availableUnits: userUnits || [],
      isLoading
    }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}
