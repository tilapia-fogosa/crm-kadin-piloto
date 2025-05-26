
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserUnit } from '@/components/kanban/hooks/useUserUnit';

interface UnitContextType {
  // Manter o selectedUnitId para compatibilidade com código existente
  selectedUnitId: string | null;
  setSelectedUnitId: (unitId: string | null) => void;
  
  // Novo suporte para seleção múltipla
  selectedUnitIds: string[];
  setSelectedUnitIds: (unitIds: string[]) => void;
  
  availableUnits: { unit_id: string; units: { id: string; name: string; } }[];
  isLoading: boolean;
  error: Error | null;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const { data: userUnits, isLoading, error } = useUserUnit();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  console.log('UnitProvider status:', { isLoading, userUnits, selectedUnitId });

  // Inicializa a seleção de unidade quando os dados são carregados
  useEffect(() => {
    if (!isLoading && userUnits && userUnits.length > 0 && !selectedUnitId) {
      console.log('Inicializando selectedUnitId com primeira unidade:', userUnits[0].unit_id);
      setSelectedUnitId(userUnits[0].unit_id);
      setSelectedUnitIds([userUnits[0].unit_id]);
    }
  }, [userUnits, isLoading, selectedUnitId]);

  // Sincroniza a seleção única com a seleção múltipla
  useEffect(() => {
    if (selectedUnitId) {
      console.log('Sincronizando selectedUnitId para selectedUnitIds:', selectedUnitId);
      if (!selectedUnitIds.includes(selectedUnitId)) {
        setSelectedUnitIds([selectedUnitId]);
      }
    }
  }, [selectedUnitId]);

  // Gate de renderização: só renderiza children quando o contexto estiver pronto
  if (isLoading || !userUnits || selectedUnitId === null) {
    console.log('UnitProvider ainda carregando ou sem unidade selecionada');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando unidades...</p>
        </div>
      </div>
    );
  }

  const value = {
    selectedUnitId,
    setSelectedUnitId,
    selectedUnitIds,
    setSelectedUnitIds,
    availableUnits: userUnits || [],
    isLoading: false, // Sempre false aqui, pois já passou pelo gate
    error
  };

  console.log('UnitProvider renderizando children com contexto completo:', value);

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
