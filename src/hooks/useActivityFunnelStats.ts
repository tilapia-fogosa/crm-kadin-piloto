
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subYears } from "date-fns";

export interface ActivityFunnelPeriod {
  totalContacts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  completedVisits: number;
  enrollments: number;
  effectiveContactsRate: number;
  scheduledVisitsRate: number;
  completedVisitsRate: number;
  enrollmentsRate: number;
  comparison: {
    totalContacts: number;
    effectiveContacts: number;
    scheduledVisits: number;
    completedVisits: number;
    enrollments: number;
    effectiveContactsRate: number;
    scheduledVisitsRate: number;
    completedVisitsRate: number;
    enrollmentsRate: number;
  };
}

export interface ActivityFunnelData {
  oneMonth: ActivityFunnelPeriod;
  threeMonths: ActivityFunnelPeriod;
  sixMonths: ActivityFunnelPeriod;
  twelveMonths: ActivityFunnelPeriod;
}

export function useActivityFunnelStats(unitId: string | null) {
  return useQuery({
    queryKey: ['activity-funnel-stats', unitId],
    queryFn: async (): Promise<ActivityFunnelData | null> => {
      console.log('Buscando estatísticas de funil de atividades para unidade:', unitId);
      
      if (!unitId) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }

      const now = new Date();
      
      // Função para calcular estatísticas de um período
      const getStatsForPeriod = async (
        monthsAgo: number
      ): Promise<ActivityFunnelPeriod> => {
        // Período atual
        const endDate = endOfMonth(now);
        const startDate = startOfMonth(subMonths(now, monthsAgo - 1));

        // Mesmo período do ano anterior
        const previousEndDate = endOfMonth(subYears(endDate, 1));
        const previousStartDate = startOfMonth(subYears(startDate, 1));

        console.log(`Calculando estatísticas para período de ${monthsAgo} meses:`, {
          atual: `${startDate.toISOString()} até ${endDate.toISOString()}`,
          anterior: `${previousStartDate.toISOString()} até ${previousEndDate.toISOString()}`
        });

        // Busca atividades do período atual
        const { data: currentActivities, error: currentError } = await supabase
          .from('client_activities')
          .select('tipo_atividade, created_at')
          .eq('active', true)
          .eq('unit_id', unitId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (currentError) {
          console.error('Erro ao buscar atividades atuais:', currentError);
          throw currentError;
        }

        // Busca atividades do período anterior
        const { data: previousActivities, error: previousError } = await supabase
          .from('client_activities')
          .select('tipo_atividade, created_at')
          .eq('active', true)
          .eq('unit_id', unitId)
          .gte('created_at', previousStartDate.toISOString())
          .lte('created_at', previousEndDate.toISOString());

        if (previousError) {
          console.error('Erro ao buscar atividades anteriores:', previousError);
          throw previousError;
        }

        console.log(`Total de atividades encontradas - Atual: ${currentActivities.length}, Anterior: ${previousActivities.length}`);

        // Cálculo para o período atual
        const currentStats = calculateStats(currentActivities);
        
        // Cálculo para o período anterior
        const previousStats = calculateStats(previousActivities);

        // Montar objeto de retorno com os dados atuais e comparativos
        return {
          ...currentStats,
          comparison: previousStats
        };
      };

      try {
        // Calcular estatísticas para todos os períodos solicitados
        const [oneMonth, threeMonths, sixMonths, twelveMonths] = await Promise.all([
          getStatsForPeriod(1),
          getStatsForPeriod(3),
          getStatsForPeriod(6),
          getStatsForPeriod(12)
        ]);

        console.log('Estatísticas de funil calculadas com sucesso');
        
        return {
          oneMonth,
          threeMonths,
          sixMonths,
          twelveMonths
        };
      } catch (error) {
        console.error('Erro ao calcular estatísticas de funil:', error);
        throw error;
      }
    },
    enabled: !!unitId
  });
}

// Função auxiliar para calcular estatísticas a partir de um conjunto de atividades
function calculateStats(activities: any[]): Omit<ActivityFunnelPeriod, 'comparison'> {
  console.log('Calculando estatísticas a partir de', activities.length, 'atividades');
  
  // A) Total Contatos: contagem do nº atividades "Tentativa de Contato" + "Contato Efetivo" + "Agendamento"
  const totalContacts = activities.filter(a => 
    ["Tentativa de Contato", "Contato Efetivo", "Agendamento"].includes(a.tipo_atividade)
  ).length;
  
  // B) Contato Efetivo: contagem do Nº atividades "Contato Efeitvo" + "Agendamento"
  const effectiveContacts = activities.filter(a => 
    ["Contato Efetivo", "Agendamento"].includes(a.tipo_atividade)
  ).length;
  
  // C) Agendamento: contagem do nº atividades "Agendamento"
  const scheduledVisits = activities.filter(a => 
    a.tipo_atividade === "Agendamento"
  ).length;
  
  // D) Atendimento: contagem do nº de atividades do "Atendimento"
  const completedVisits = activities.filter(a => 
    a.tipo_atividade === "Atendimento"
  ).length;
  
  // E) Matrícula: contagem do nº de atividades "Matrícula"
  const enrollments = activities.filter(a => 
    a.tipo_atividade === "Matrícula"
  ).length;
  
  // Cálculos percentuais
  // B) % do ("Contato Efetivo" + "Agendamento") dividido por ("Tentativa de Contato" + "Contato Efeitvo" + "Agendamento")
  const effectiveContactsRate = totalContacts > 0 
    ? (effectiveContacts / totalContacts) * 100 
    : 0;
  
  // C) % do "Agendamento" dividido por ("Contato Efetivo" + Agendamento")
  const scheduledVisitsRate = effectiveContacts > 0 
    ? (scheduledVisits / effectiveContacts) * 100 
    : 0;
  
  // D) % do "Atendimento" dividido por "Agendamento"
  const completedVisitsRate = scheduledVisits > 0 
    ? (completedVisits / scheduledVisits) * 100 
    : 0;
  
  // E) % do Matrícula dividido por "Atendimento"
  const enrollmentsRate = completedVisits > 0 
    ? (enrollments / completedVisits) * 100 
    : 0;

  console.log('Estatísticas calculadas:', {
    totalContacts,
    effectiveContacts,
    scheduledVisits,
    completedVisits,
    enrollments,
    effectiveContactsRate,
    scheduledVisitsRate,
    completedVisitsRate,
    enrollmentsRate
  });

  return {
    totalContacts,
    effectiveContacts,
    scheduledVisits,
    completedVisits,
    enrollments,
    effectiveContactsRate,
    scheduledVisitsRate,
    completedVisitsRate,
    enrollmentsRate
  };
}
