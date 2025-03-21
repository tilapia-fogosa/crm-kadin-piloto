
import { CommercialFilters } from "./components/CommercialFilters";
import { useState } from "react";
import { useCommercialStats } from "./hooks/useCommercialStats";
import { calculateTotals } from "./utils/stats.utils";
import { CommercialTableOne } from "./components/CommercialTableOne";
import { CommercialUserTable } from "./components/CommercialUserTable";
import { CommercialTableThree } from "./components/CommercialTableThree";
import { useCommercialUserStats } from "./hooks/useCommercialUserStats";

export function CommercialDashboard() {
  console.log("Rendering CommercialDashboard");
  
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const { data: stats, isLoading } = useCommercialStats(
    selectedSource, 
    selectedMonth, 
    selectedYear,
    selectedUnitId
  );
  
  const { data: userStats, isLoading: isLoadingUserStats } = useCommercialUserStats(
    selectedSource, 
    selectedMonth, 
    selectedYear,
    selectedUnitId
  );
  
  const totals = calculateTotals(stats);

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
              selectedSource={selectedSource}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              totals={totals}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Totais por Usuário</h2>
            <CommercialUserTable stats={userStats} totals={totals} isLoading={isLoadingUserStats} />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Tabela 3</h2>
            <CommercialTableThree stats={stats} totals={totals} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
