import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useUserUnit } from "./hooks/useUserUnit";
import { ActivityFilters } from "./components/dashboard/ActivityFilters";
import { ActivityTable } from "./components/dashboard/ActivityTable";
import { useActivityStats } from "./hooks/useActivityStats";
import { calculateTotals } from "./utils/stats.utils";

export function ActivityDashboard() {
  // Inicializar com o mês atual
  const currentDate = new Date();
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());
  const [selectedUnitId, setSelectedUnitId] = useState<string>("todas");
  const { data: userUnits } = useUserUnit();

  console.log('ActivityDashboard iniciado com:', {
    mês: selectedMonth,
    ano: selectedYear,
    dataAtual: currentDate,
    mêsJS: currentDate.getMonth(), // 0-11
    mêsAjustado: currentDate.getMonth() + 1 // 1-12
  });

  const { data: leadSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      console.log('Fetching lead sources')
      const { data, error } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: stats, isLoading } = useActivityStats(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    userUnits,
    selectedUnitId
  );
  
  const totals = calculateTotals(stats);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
          <LineChart className="h-4 w-4" />
          <span className="text-xs">Painel de</span>
          <span className="text-xs">Atividades</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <LineChart className="h-6 w-6" />
            Painel de Atividades
          </DialogTitle>
          <ActivityFilters
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedUnitId={selectedUnitId}
            setSelectedUnitId={setSelectedUnitId}
            leadSources={leadSources}
          />
        </DialogHeader>
        <div className="mt-4">
          <ActivityTable stats={stats} totals={totals} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
