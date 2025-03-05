
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CommercialStats {
  id: string;
  name: string;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
}

interface RawActivityData {
  client_id: string;
  unit_id: string;
  unit_name: string;
  lead_source: string;
  source_name: string;
  user_id: string;
  user_name: string;
  created_at: string;
  tipo_atividade: string;
  scheduled_date: string;
  status: string;
  month: number;
  year: number;
}

const processStats = (data: RawActivityData[], groupBy: 'unit' | 'user' | 'source'): CommercialStats[] => {
  // Group data by the specified key
  const grouped = data.reduce((acc, curr) => {
    const key = groupBy === 'unit' ? curr.unit_id 
              : groupBy === 'user' ? curr.user_id 
              : curr.lead_source;
    const name = groupBy === 'unit' ? curr.unit_name
               : groupBy === 'user' ? curr.user_name
               : curr.source_name;

    if (!key) return acc;

    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: name || key,
        newClients: new Set(),
        contactAttempts: 0,
        effectiveContacts: 0,
        scheduledVisits: 0,
        awaitingVisits: 0,
        completedVisits: 0,
        enrollments: 0
      };
    }

    // Add client to unique set
    acc[key].newClients.add(curr.client_id);

    // Count activities
    if (curr.tipo_atividade) {
      if (['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(curr.tipo_atividade)) {
        acc[key].contactAttempts++;
      }
      if (['Contato Efetivo', 'Agendamento'].includes(curr.tipo_atividade)) {
        acc[key].effectiveContacts++;
      }
      if (curr.tipo_atividade === 'Agendamento') {
        acc[key].scheduledVisits++;
      }
      if (curr.tipo_atividade === 'Atendimento') {
        if (curr.scheduled_date && new Date(curr.scheduled_date) > new Date()) {
          acc[key].awaitingVisits++;
        } else {
          acc[key].completedVisits++;
        }
      }
    }

    // Count enrollments
    if (curr.status === 'matriculado') {
      acc[key].enrollments++;
    }

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate rates
  return Object.values(grouped).map(group => ({
    id: group.id,
    name: group.name,
    newClients: group.newClients.size,
    contactAttempts: group.contactAttempts,
    effectiveContacts: group.effectiveContacts,
    ceConversionRate: group.contactAttempts > 0 
      ? (group.effectiveContacts / group.contactAttempts) * 100 
      : 0,
    scheduledVisits: group.scheduledVisits,
    agConversionRate: group.effectiveContacts > 0 
      ? (group.scheduledVisits / group.effectiveContacts) * 100 
      : 0,
    awaitingVisits: group.awaitingVisits,
    completedVisits: group.completedVisits,
    atConversionRate: group.scheduledVisits > 0 
      ? (group.completedVisits / group.scheduledVisits) * 100 
      : 0,
    enrollments: group.enrollments
  }));
};

export const useCommercialStats = (month: string, year: string) => {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['commercial-activities-data', month, year],
    queryFn: async () => {
      console.log('Buscando dados comerciais:', { month, year });

      const { data, error } = await supabase
        .from('commercial_activities_data')
        .select('*')
        .eq('month', month)
        .eq('year', year);

      if (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
      }

      return data as RawActivityData[];
    }
  });

  return {
    unitStats: rawData ? processStats(rawData, 'unit') : [],
    userStats: rawData ? processStats(rawData, 'user') : [],
    sourceStats: rawData ? processStats(rawData, 'source') : [],
    isLoading
  };
};
