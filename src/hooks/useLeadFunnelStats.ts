
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format, startOfDay, endOfDay, parseISO } from "date-fns";

export type DateRangeType = "month" | "quarter" | "custom";

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

export function useLeadFunnelStats(
  unitId: string | null,
  dateRange: DateRangeType,
  startDate?: Date,
  endDate?: Date
) {
  console.log('Buscando estatísticas do funil de leads para:', { unitId, dateRange, startDate, endDate });
  
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
      
      if (dateRange === 'custom' && startDate && endDate) {
        // Usar datas personalizadas se fornecidas
        queryStartDate = startOfDay(startDate);
        queryEndDate = endOfDay(endDate);
      } else if (dateRange === 'quarter') {
        // Últimos 3 meses
        queryStartDate = startOfDay(subMonths(new Date(), 3));
      } else {
        // Último mês (padrão)
        queryStartDate = startOfDay(subMonths(new Date(), 1));
      }
      
      console.log('Intervalo de datas para consulta:', {
        inicio: queryStartDate.toISOString(),
        fim: queryEndDate.toISOString()
      });

      // 1. Buscar todos os leads criados no período para a unidade
      const { data: leads, error: leadsError } = await supabase
        .from('clients')
        .select('id, created_at')
        .eq('unit_id', unitId)
        .eq('active', true)
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
      
      const leadIds = leads.map(lead => lead.id);
      console.log(`Encontrados ${leadIds.length} leads no período`);
      
      // 2. Para esses leads, buscar as atividades por tipo
      const { data: activities, error: activitiesError } = await supabase
        .from('client_activities')
        .select('client_id, tipo_atividade')
        .eq('active', true)
        .in('client_id', leadIds);
        
      if (activitiesError) {
        console.error('Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      // 3. Contar leads por estágio mais avançado
      const totalLeads = leadIds.length;
      
      // Agrupar atividades por client_id
      const leadActivitiesMap = new Map<string, Set<string>>();
      
      activities?.forEach(activity => {
        if (!leadActivitiesMap.has(activity.client_id)) {
          leadActivitiesMap.set(activity.client_id, new Set());
        }
        leadActivitiesMap.get(activity.client_id)?.add(activity.tipo_atividade);
      });
      
      // Contar leads que chegaram a cada etapa
      const effectiveContacts = Array.from(leadActivitiesMap.values()).filter(
        activities => activities.has('contato-efetivo') || 
                     activities.has('agendamento') || 
                     activities.has('atendimento')
      ).length;
      
      const scheduledVisits = Array.from(leadActivitiesMap.values()).filter(
        activities => activities.has('agendamento') || 
                     activities.has('atendimento')
      ).length;
      
      const completedVisits = Array.from(leadActivitiesMap.values()).filter(
        activities => activities.has('atendimento')
      ).length;
      
      // 4. Buscar matrículas no período para esses leads
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('sales')
        .select('client_id')
        .eq('active', true)
        .eq('unit_id', unitId)
        .in('client_id', leadIds);
        
      if (enrollmentsError) {
        console.error('Erro ao buscar matrículas:', enrollmentsError);
        throw enrollmentsError;
      }
      
      // Deduzir matrículas únicas (um lead pode ter várias matrículas, mas contamos apenas uma vez)
      const uniqueEnrollments = new Set(enrollments?.map(e => e.client_id)).size;
      
      // 5. Calcular taxas
      const calculateRate = (value: number, total: number) => {
        return total > 0 ? (value / total) * 100 : 0;
      };
      
      console.log('Dados do funil de lead calculados:', {
        totalLeads,
        effectiveContacts,
        scheduledVisits,
        completedVisits,
        uniqueEnrollments
      });
      
      return {
        totalLeads,
        effectiveContacts,
        scheduledVisits,
        completedVisits,
        enrollments: uniqueEnrollments,
        effectiveContactRate: calculateRate(effectiveContacts, totalLeads),
        scheduledVisitsRate: calculateRate(scheduledVisits, totalLeads),
        completedVisitsRate: calculateRate(completedVisits, totalLeads),
        enrollmentsRate: calculateRate(uniqueEnrollments, totalLeads)
      };
    },
    enabled: !!unitId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000 // 1 hora
  });
}
