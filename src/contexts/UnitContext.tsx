
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserUnit } from '@/components/kanban/hooks/useUserUnit';

interface UnitContextType {
  selectedUnitId: string | null;
  setSelectedUnitId: (unitId: string | null) => void;
  availableUnits: { unit_id: string; units: { id: string; name: string; } }[];
  isLoading: boolean;
  error: Error | null;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const { data: userUnits, isLoading, error } = useUserUnit();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Set first available unit as default when units are loaded
  useEffect(() => {
    console.log('UnitProvider effect:', { isLoading, userUnits, initialized });
    
    if (!isLoading && userUnits && userUnits.length > 0 && !initialized) {
      console.log('Setting initial unit:', userUnits[0].unit_id);
      setSelectedUnitId(userUnits[0].unit_id);
      setInitialized(true);
    }
  }, [userUnits, isLoading, initialized]);

  const value = {
    selectedUnitId,
    setSelectedUnitId,
    availableUnits: userUnits || [],
    isLoading: isLoading || !initialized,
    error
  };

  console.log('UnitProvider rendering with:', value);

  return (
    <UnitContext.Provider value={value}>
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
