
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  subMonths, 
  format, 
  startOfDay, 
  endOfDay, 
  parseISO, 
  startOfMonth, 
  endOfMonth,
  isAfter
} from "date-fns";

export type DateRangeType = "current-month" | "previous-month" | "quarter" | "custom";

export interface LeadFunnelStats {
  totalLeads: number;
  effectiveContacts: number;
  scheduledVisits: number;
  completedVisits: number;
  enrollments: number;
  effectiveContactRate: number;
  scheduledVisitsRate: number;
  completedVisitsRate: number;
  enrollmentsRate: number;
}

// Função auxiliar para determinar a progressão máxima do cliente baseado nas atividades
const getClientMaxProgression = (activities: any[] = []) => {
  // Log inicial para rastreamento
  console.log(`Analisando ${activities.length} atividades para determinar progressão máxima`);
  
  // Define resultado padrão (nenhuma progressão)
  let result = {
    hasEffectiveContact: false,
    hasScheduledVisit: false,
    hasCompletedVisit: false,
    hasEnrollment: false
  };
  
  // Se não há atividades, retorna padrão
  if (!activities || activities.length === 0) {
    return result;
  }
  
  // Filtra para considerar apenas atividades ativas (não excluídas logicamente)
  const activeActivities = activities.filter(activity => activity.active === true);
  
  // Log para mostrar quantas atividades foram filtradas
  console.log(`Considerando ${activeActivities.length} atividades ativas de ${activities.length} totais`);
  
  // Analisa cada atividade ativa para determinar a progressão máxima
  activeActivities.forEach(activity => {
    const tipo = activity.tipo_atividade;
    
    // Verifica cada tipo de atividade e marca na progressão
    if (['Contato Efetivo', 'Agendamento', 'Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasEffectiveContact = true;
    }
    
    if (['Agendamento', 'Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasScheduledVisit = true;
    }
    
    if (['Atendimento', 'Matrícula'].includes(tipo)) {
      result.hasCompletedVisit = true;
    }
    
    if (tipo === 'Matrícula') {
      result.hasEnrollment = true;
    }
  });
  
  // Log final para depuração
  console.log("Progressão máxima determinada:", result);
  
  return result;
};

export function useLeadFunnelStats(
  unitId: string | null,
  dateRange: DateRangeType,
  startDate?: Date,
  endDate?: Date
) {
  console.log('Iniciando hook useLeadFunnelStats:', { unitId, dateRange, startDate, endDate });
  
  return useQuery({
    queryKey: ['lead-funnel-stats', unitId, dateRange, startDate, endDate],
    queryFn: async (): Promise<LeadFunnelStats | null> => {
      if (!unitId) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }
      
      // Determinar datas de início e fim com base no tipo de intervalo
      let queryStartDate: Date;
      let queryEndDate: Date = endOfDay(new Date()); // Hoje por padrão
      const today = new Date();
      
      if (dateRange === 'custom' && startDate && endDate) {
        // Usar datas personalizadas se fornecidas
        queryStartDate = startOfDay(startDate);
        queryEndDate = endOfDay(endDate);
      } else if (dateRange === 'quarter') {
        // Últimos 3 meses completos
        queryStartDate = startOfMonth(subMonths(today, 3));
      } else if (dateRange === 'current-month') {
        // Mês atual (do dia 1 até hoje)
        queryStartDate = startOfMonth(today);
      } else {
        // Mês anterior completo (padrão)
        queryStartDate = startOfMonth(subMonths(today, 1));
        queryEndDate = endOfMonth(subMonths(today, 1));
      }
      
      console.log('Intervalo de datas para consulta:', {
        inicio: queryStartDate.toISOString(),
        fim: queryEndDate.toISOString(),
        unidade: unitId
      });

      try {
        // Buscar todos os leads ATIVOS criados no período (excluindo logicamente excluídos)
        const { data: leads, error: leadsError } = await supabase
          .from('clients')
          .select('id, created_at, status, client_activities(id, tipo_atividade, created_at, active)')
          .eq('unit_id', unitId)
          .eq('active', true) // Filtrar apenas clientes ativos
          .gte('created_at', queryStartDate.toISOString())
          .lte('created_at', queryEndDate.toISOString());
        
        if (leadsError) {
          console.error('Erro ao buscar leads:', leadsError);
          throw leadsError;
        }
        
        if (!leads || leads.length === 0) {
          console.log('Nenhum lead encontrado no período selecionado');
          return {
            totalLeads: 0,
            effectiveContacts: 0,
            scheduledVisits: 0,
            completedVisits: 0,
            enrollments: 0,
            effectiveContactRate: 0,
            scheduledVisitsRate: 0,
            completedVisitsRate: 0,
            enrollmentsRate: 0
          };
        }
        
        console.log(`Encontrados ${leads.length} leads ativos no período para unidade ${unitId}`);
        
        // Processar cada lead para determinar sua progressão máxima
        let effectiveContacts = 0;
        let scheduledVisits = 0;
        let completedVisits = 0;
        let enrollments = 0;
        
        leads.forEach(lead => {
          // Analisar atividades para determinar a progressão máxima do lead
          const progression = getClientMaxProgression(lead.client_activities);
          
          // Incrementar contadores com base na progressão
          if (progression.hasEffectiveContact) effectiveContacts++;
          if (progression.hasScheduledVisit) scheduledVisits++;
          if (progression.hasCompletedVisit) completedVisits++;
          if (progression.hasEnrollment) enrollments++;
          
          // Log detalhado para cada lead
          console.log(`Lead ${lead.id} (status: ${lead.status}) - Progressão:`, progression);
        });
        
        // Calcular taxas de conversão
        const totalLeads = leads.length;
        const calculateRate = (value: number, total: number) => {
          return total > 0 ? (value / total) * 100 : 0;
        };
        
        const result = {
          totalLeads,
          effectiveContacts,
          scheduledVisits,
          completedVisits,
          enrollments,
          effectiveContactRate: calculateRate(effectiveContacts, totalLeads),
          scheduledVisitsRate: calculateRate(scheduledVisits, totalLeads),
          completedVisitsRate: calculateRate(completedVisits, totalLeads),
          enrollmentsRate: calculateRate(enrollments, totalLeads)
        };
        
        console.log('Cálculo do funil finalizado:', result);
        
        return result;
      } catch (error) {
        console.error('Erro ao calcular estatísticas do funil:', error);
        throw error;
      }
    },
    enabled: !!unitId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000 // 1 hora
  });
}
