import { useState } from "react";
import { useUnit } from "@/contexts/UnitContext";
import { CommercialFilters } from "./components/CommercialFilters";
import { CommercialTableOne } from "./components/CommercialTableOne";
import { CommercialUserTable } from "./components/CommercialUserTable";
import { CommercialTableThree } from "./components/CommercialTableThree";
import { useCommercialStats } from "./hooks/useCommercialStats";
import { calculateTotals } from "./utils/stats.utils";

export function CommercialDashboard() {
  console.log("Rendering CommercialDashboard");
  
  // Estado dos filtros
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Contexto de unidades
  const { availableUnits } = useUnit();
  const availableUnitIds = availableUnits.map(unit => unit.unit_id);
  
  // Buscar dados usando o novo hook otimizado
  const { 
    unitStats, 
    userStats, 
    isLoadingUnitStats, 
    isLoadingUserStats 
  } = useCommercialStats({
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
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
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedUnitId={selectedUnitId}
          setSelectedUnitId={setSelectedUnitId}
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
            <h2 className="text-lg font-semibold mb-4">Resumo por Unidade</h2>
            <CommercialTableThree 
              stats={unitStats} 
              totals={unitTotals} 
              isLoading={isLoadingUnitStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
