
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
        fim: queryEndDate.toISOString(),
        unidade: unitId
      });

      try {
        // 1. Buscar todos os leads criados no período para a unidade
        const { data: leads, error: leadsError } = await supabase
          .from('clients')
          .select('id, created_at, status')
          .eq('unit_id', unitId)
          .eq('active', true)
          .gte('created_at', queryStartDate.toISOString())
          .lte('created_at', queryEndDate.toISOString());

        if (leadsError) {
          console.error('Erro ao buscar leads:', leadsError);
          throw leadsError;
        }
        
        console.log(`Encontrados ${leads?.length || 0} leads no período`);
        
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
        
        // 2. Buscar atividades de cada tipo para esses leads
        // Buscar leads com contato efetivo (status contato-efetivo ou superior)
        const effectiveContacts = leads.filter(lead => 
          ['contato-efetivo', 'atendimento-agendado', 'atendimento-realizado', 'negociacao', 'matriculado'].includes(lead.status)
        ).length;
        
        // Buscar leads com agendamento (status atendimento-agendado ou superior)
        const scheduledVisits = leads.filter(lead => 
          ['atendimento-agendado', 'atendimento-realizado', 'negociacao', 'matriculado'].includes(lead.status)
        ).length;
        
        // Buscar leads com atendimento realizado (status atendimento-realizado ou superior)
        const completedVisits = leads.filter(lead => 
          ['atendimento-realizado', 'negociacao', 'matriculado'].includes(lead.status)
        ).length;
        
        // 3. Buscar matrículas para esses leads no período
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
        const uniqueEnrollments = new Set(enrollments?.map(e => e.client_id) || []).size;
        
        // 4. Calcular taxas
        const totalLeads = leads.length;
        const calculateRate = (value: number, total: number) => {
          return total > 0 ? (value / total) * 100 : 0;
        };
        
        const result = {
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
