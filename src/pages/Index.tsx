
import React from 'react';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { RecentClientsList } from '@/components/dashboard/RecentClientsList';
import { useLeadsStats } from '@/hooks/useLeadsStats';
import { useUnit } from '@/contexts/UnitContext';
import { UnitSelector } from '@/components/UnitSelector';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActivityFunnelStats } from '@/components/dashboard/ActivityFunnelStats';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

function Index() {
  console.log("Rendering Dashboard/Index page");
  
  const { selectedUnitId, isLoading: isLoadingUnit } = useUnit();
  const { data: leadsStats } = useLeadsStats(selectedUnitId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UnitSelector />
      </div>
      
      {isLoadingUnit ? (
        <div>Carregando...</div>
      ) : !selectedUnitId ? (
        <div>Selecione uma unidade para ver os dados</div>
      ) : (
        <div className="space-y-6">
          {/* Primeira linha: Estatísticas de leads */}
          <DashboardStats leadsStats={leadsStats} />
          
          {/* Disclaimer sobre atividades */}
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-600 font-bold">ATIVIDADES</AlertTitle>
            <AlertDescription className="text-red-700">
              <p>
                Abaixo listamos o total de atividades operadas pela unidade. Cada atividade como "Tentativa de Contato", 
                "Contato Efetivo", "Agendamento" e "Atendimento" podem se repetir e serem contadas mais de uma vez por lead.
              </p>
              <p className="mt-2">
                Isto é: existe repetição de atividade do lead, não sendo esta o FUNIL DE CONVERSÃO por lead, 
                mas o funil de conversão por ATIVIDADE.
              </p>
              <p className="mt-2">
                O objetivo destes dados é monitorar no curto, médio e longo prazo a PRODUTIVIDADE da sua equipe e unidade.
              </p>
            </AlertDescription>
          </Alert>
          
          {/* Segunda e terceira linhas: Funil de conversão */}
          <ActivityFunnelStats unitId={selectedUnitId} />
          
          {/* Quarta linha: Gráfico e lista de clientes recentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <LeadsChart />
            </div>
            <div className="w-full">
              <RecentClientsList />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
