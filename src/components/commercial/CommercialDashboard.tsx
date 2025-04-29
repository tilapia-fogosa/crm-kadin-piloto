
import { useState, useEffect } from "react";
import { useUnit } from "@/contexts/UnitContext";
import { CommercialFilters } from "./components/CommercialFilters";
import { CommercialTableOne } from "./components/CommercialTableOne";
import { CommercialUserTable } from "./components/CommercialUserTable";
import { CommercialTableByRegistration } from "./components/CommercialTableByRegistration";
import { useCommercialStats } from "./hooks/useCommercialStats";
import { useRegistrationStats } from "./hooks/useRegistrationStats";
import { calculateTotals } from "./utils/stats.utils";

export function CommercialDashboard() {
  console.log("Rendering CommercialDashboard");
  
  // Estado dos filtros com seleção múltipla
  const [selectedSources, setSelectedSources] = useState<string[]>(['todos']);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([new Date().getMonth().toString()]);
  const [selectedYears, setSelectedYears] = useState<string[]>([new Date().getFullYear().toString()]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['todos']);

  // Contexto de unidades
  const { availableUnits } = useUnit();
  const availableUnitIds = availableUnits.map(unit => unit.unit_id);
  
  // Inicializar valores padrão quando availableUnits estiver disponível
  useEffect(() => {
    if (availableUnits && availableUnits.length > 0 && selectedUnitIds.length === 0) {
      setSelectedUnitIds(['todos']);
    }
  }, [availableUnits, selectedUnitIds]);
  
  // Buscar dados usando os hooks otimizados
  const { 
    unitStats, 
    userStats, 
    isLoadingUnitStats, 
    isLoadingUserStats 
  } = useCommercialStats({
    selectedSources,
    selectedMonths,
    selectedYears,
    selectedUnitIds,
    availableUnitIds
  });

  const {
    registrationGroups,
    isLoading: isLoadingRegistrationStats
  } = useRegistrationStats({
    selectedSources,
    selectedMonths,
    selectedYears,
    selectedUnitIds,
    availableUnitIds
  });

  // Calcular totais
  const unitTotals = calculateTotals(unitStats || []);
  const userTotals = calculateTotals(userStats || []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Indicadores Comerciais</h1>
      
      <div className="space-y-8">
        <CommercialFilters
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
          selectedMonths={selectedMonths}
          setSelectedMonths={setSelectedMonths}
          selectedYears={selectedYears}
          setSelectedYears={setSelectedYears}
          selectedUnitIds={selectedUnitIds}
          setSelectedUnitIds={setSelectedUnitIds}
        />
        
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Totais por Unidade</h2>
            <CommercialTableOne 
              stats={unitStats}
              totals={unitTotals}
              isLoading={isLoadingUnitStats}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Totais por Usuário</h2>
            <CommercialUserTable 
              stats={userStats}
              totals={userTotals}
              isLoading={isLoadingUserStats}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Totais por Origem e Registro</h2>
            <CommercialTableByRegistration 
              stats={registrationGroups}
              isLoading={isLoadingRegistrationStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
