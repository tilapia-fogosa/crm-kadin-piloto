
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useUserUnit } from "./hooks/useUserUnit";
import { ActivityFiltersV2 } from "./components/dashboard/ActivityFiltersV2";
import { ActivityTableV2 } from "./components/dashboard/ActivityTableV2";
import { useActivityStatsV2 } from "./hooks/v2/useActivityStatsV2";
import { calculateTotalsV2 } from "./utils/v2/statsUtilsV2";

export function ActivityDashboardV2() {
  // Estado inicial - usando o mês atual
  const currentMonth = (new Date().getMonth() + 1).toString(); // +1 porque getMonth() retorna 0-11
  const currentYear = new Date().getFullYear().toString();
  
  // Estados locais para os filtros
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("todas");
  
  // Informação sobre unidades do usuário
  const { data: userUnits } = useUserUnit();

  // Buscar origens de leads
  const { data: leadSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      console.log('[V2] Buscando fontes de leads')
      const { data, error } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  // Buscar estatísticas usando o hook otimizado
  const { data: stats, isLoading } = useActivityStatsV2(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    selectedUnitId
  );
  
  // Calcular totais
  const totals = calculateTotalsV2(stats);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-1 h-auto py-2">
          <LineChart className="h-4 w-4" />
          <span className="text-xs">Painel de</span>
          <span className="text-xs">Atividades V2</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <LineChart className="h-6 w-6" />
            Painel de Atividades V2
          </DialogTitle>
          <ActivityFiltersV2
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
          <ActivityTableV2 stats={stats} totals={totals} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
