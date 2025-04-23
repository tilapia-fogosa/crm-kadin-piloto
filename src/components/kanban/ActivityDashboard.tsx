
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useUserUnit } from "./hooks/useUserUnit";
import { ActivityFilters } from "./components/dashboard/ActivityFilters";
import { ActivityTable } from "./components/dashboard/ActivityTable";
import { useAggregatedActivityStats } from "./hooks/useAggregatedActivityStats";
import { calculateTotals } from "./utils/stats.utils";

export function ActivityDashboard() {
  // Inicializar com o mês atual
  const currentDate = new Date();
  const [selectedSource, setSelectedSource] = useState<string>("todos");
  
  // Garantir que o mês esteja no formato correto (1-12)
  const currentMonth = currentDate.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());
  const [selectedUnitId, setSelectedUnitId] = useState<string>("todas");
  const { data: userUnits } = useUserUnit();
  
  // Estado para controlar se o diálogo está aberto
  const [isOpen, setIsOpen] = useState<boolean>(false);

  console.log('ActivityDashboard iniciado com:', {
    mês: selectedMonth,
    ano: selectedYear,
    dataAtual: currentDate,
    mêsAtual: currentMonth,
    isOpen: isOpen
  });

  const { data: leadSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      console.log('Buscando fontes de leads');
      const { data, error } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  // Função para manipular a abertura/fechamento do diálogo
  const handleOpenChange = (open: boolean) => {
    console.log(`Dialog ${open ? 'aberto' : 'fechado'}`);
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          {/* Componente para coletar e exibir as estatísticas (somente quando o diálogo estiver aberto) */}
          <ActivityDataSection 
            selectedSource={selectedSource}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedUnitId={selectedUnitId}
            userUnits={userUnits}
            isOpen={isOpen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para gerenciar os dados de atividades
function ActivityDataSection({ 
  selectedSource, 
  selectedMonth, 
  selectedYear, 
  selectedUnitId,
  userUnits,
  isOpen
}: { 
  selectedSource: string; 
  selectedMonth: string; 
  selectedYear: string; 
  selectedUnitId: string;
  userUnits: any[] | undefined;
  isOpen: boolean;
}) {
  console.log('ActivityDataSection renderizado com isOpen =', isOpen);
  
  // Usar o novo hook com agregação no banco
  const { data: stats, isLoading } = useAggregatedActivityStats(
    selectedSource, 
    selectedMonth, 
    selectedYear, 
    userUnits,
    selectedUnitId,
    isOpen
  );
  
  const totals = calculateTotals(stats);

  return (
    <ActivityTable stats={stats} totals={totals} isLoading={isLoading} />
  );
}
