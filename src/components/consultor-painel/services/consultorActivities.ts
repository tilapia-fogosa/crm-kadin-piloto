
import { supabase } from '@/integrations/supabase/client';
import { DailyActivityData, ApiDailyActivityData } from '../types/consultor-activities.types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

/**
 * Função para buscar as atividades diárias do consultor
 * 
 * Realiza a consulta ao Supabase e formata os dados para a visualização
 * 
 * @param userId - ID do usuário autenticado
 * @param selectedMonth - Mês selecionado (1-12)
 * @param selectedYear - Ano selecionado
 * @param selectedUnitIds - IDs das unidades selecionadas
 * @returns Array de dados de atividades diárias
 */
export async function fetchConsultorActivities(
  userId: string,
  selectedMonth: number,
  selectedYear: number,
  selectedUnitIds: string[]
): Promise<DailyActivityData[]> {
  console.time('[CONSULTOR API] Tempo de execução');
  console.log('[CONSULTOR API] Iniciando busca de atividades:', {
    userId,
    selectedMonth,
    selectedYear,
    unitIds: selectedUnitIds
  });

  try {
    // Verificar parâmetros obrigatórios
    if (!userId) throw new Error('ID do usuário é obrigatório');
    if (!selectedMonth || !selectedYear) throw new Error('Mês e ano são obrigatórios');
    if (!selectedUnitIds.length) throw new Error('Pelo menos uma unidade deve ser selecionada');

    // Calcular início e fim do mês selecionado
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1));
    
    // Gerar lista de todos os dias do mês
    const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Criar um mapa inicial com todos os dias do mês (incluindo dias sem atividades)
    const initialData: Record<string, DailyActivityData> = {};
    
    // Inicializar todos os dias com valores zero
    allDaysInMonth.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      initialData[dateString] = {
        dia: dateString,
        tentativa_contato: 0,
        contato_efetivo: 0,
        atendimento_agendado: 0,
        atendimento_realizado: 0,
        matriculas: 0
      };
    });
    
    // Executar a consulta Supabase (usando SQL direto em vez de RPC)
    const { data: activities, error } = await supabase
      .from('client_activities')
      .select(`
        created_at,
        tipo_atividade,
        active,
        unit_id,
        client_id,
        clients!inner(active)
      `)
      .eq('active', true)
      .in('unit_id', selectedUnitIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('clients.active', true);

    if (error) throw error;
    
    console.log('[CONSULTOR API] Dados recebidos:', activities ? activities.length : 0, 'registros');
    
    // Processar os dados recebidos
    if (activities && activities.length > 0) {
      activities.forEach(activity => {
        const dateKey = activity.created_at.split('T')[0];
        
        if (initialData[dateKey]) {
          switch (activity.tipo_atividade) {
            case 'Tentativa de Contato':
              initialData[dateKey].tentativa_contato++;
              break;
            case 'Contato Efetivo':
              initialData[dateKey].contato_efetivo++;
              break;
            case 'Agendamento':
              initialData[dateKey].atendimento_agendado++;
              break;
            case 'Atendimento':
              initialData[dateKey].atendimento_realizado++;
              break;
            case 'Matrícula':
              initialData[dateKey].matriculas++;
              break;
          }
        }
      });
    }
    
    // Converter o mapa para um array ordenado por data
    const sortedResult = Object.values(initialData).sort((a, b) => 
      new Date(a.dia).getTime() - new Date(b.dia).getTime()
    );
    
    console.log('[CONSULTOR API] Dados finais processados:', sortedResult.length, 'dias');
    console.timeEnd('[CONSULTOR API] Tempo de execução');
    
    return sortedResult;
  } catch (error) {
    console.error('[CONSULTOR API] Erro na função fetchConsultorActivities:', error);
    console.timeEnd('[CONSULTOR API] Tempo de execução');
    throw error;
  }
}
