
import React, { useEffect } from 'react';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { RecentClientsList } from '@/components/dashboard/RecentClientsList';
import { useLeadsStats } from '@/hooks/useLeadsStats';
import { useUnit } from '@/contexts/UnitContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LeadConversionFunnel } from '@/components/dashboard/LeadConversionFunnel';
import { ActivityFunnelStats } from '@/components/dashboard/ActivityFunnelStats';
import { MultiUnitSelector } from '@/components/dashboard/MultiUnitSelector';

function Index() {
  console.log("Renderizando Dashboard/Index page");
  
  const { selectedUnitIds, isLoading: isLoadingUnit } = useUnit();
  const { data: leadsStats } = useLeadsStats(selectedUnitIds);
  
  useEffect(() => {
    console.log('Dashboard - Unidades selecionadas:', selectedUnitIds);
  }, [selectedUnitIds]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Substituído UnitSelector pelo MultiUnitSelector */}
        <MultiUnitSelector />
      </div>
      
      {isLoadingUnit ? (
        <div>Carregando...</div>
      ) : !selectedUnitIds || selectedUnitIds.length === 0 ? (
        <div>Selecione uma unidade para ver os dados</div>
      ) : (
        <div className="space-y-6">
          {/* Primeira linha: Estatísticas de leads */}
          <DashboardStats leadsStats={leadsStats} />
          
          {/* Estatísticas de atividades do funil */}
          <ActivityFunnelStats unitIds={selectedUnitIds} />
          
          {/* Disclaimer sobre atividades */}
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-600 font-bold">ATIVIDADES</AlertTitle>
            <AlertDescription className="text-red-700">
              <p>
                O gráfico abaixo mostra a taxa de conversão real dos leads cadastrados no período selecionado.
                Cada etapa representa o número de leads que atingiram aquele estágio em sua jornada.
              </p>
              <p className="mt-2">
                A contagem é feita apenas para leads criados no período selecionado,
                garantindo uma visão precisa da taxa de conversão por etapa.
              </p>
            </AlertDescription>
          </Alert>
          
          {/* Funil de Conversão */}
          <LeadConversionFunnel unitIds={selectedUnitIds} />
          
          {/* Gráfico de leads por fonte */}
          <div className="w-full">
            <LeadsChart />
          </div>
          
          {/* Lista de clientes recentes */}
          <div className="w-full">
            <RecentClientsList />
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
