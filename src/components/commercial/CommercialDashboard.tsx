
import { CommercialFilters } from "./components/CommercialFilters";
import { useState } from "react";
import { useCommercialStats } from "./hooks/useCommercialStats";
import { calculateTotals } from "./utils/stats.utils";
import { CommercialTableOne } from "./components/tables/CommercialTableOne";
import { CommercialTableTwo } from "./components/tables/CommercialTableTwo";
import { CommercialTableThree } from "./components/tables/CommercialTableThree";

export function CommercialDashboard() {
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
  const totals = calculateTotals(stats);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Indicadores Comerciais</h1>
      <div className="bg-white rounded-lg shadow p-6">
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
        
        <CommercialTableOne stats={stats} totals={totals} isLoading={isLoading} />
        <CommercialTableTwo stats={stats} totals={totals} isLoading={isLoading} />
        <CommercialTableThree stats={stats} totals={totals} isLoading={isLoading} />
      </div>
    </div>
  );
}
