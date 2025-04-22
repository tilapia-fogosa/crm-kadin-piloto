
import { supabase } from '@/integrations/supabase/client';
import { DailyActivityData } from '../types/consultor-activities.types';
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
    
    // Executar a consulta Supabase (RPC para a função que implementamos no banco)
    const { data, error } = await supabase
      .rpc('get_consultor_daily_activities', {
        p_user_id: userId,
        p_month: selectedMonth,
        p_year: selectedYear,
        p_unit_ids: selectedUnitIds
      });

    if (error) {
      console.error('[CONSULTOR API] Erro ao buscar atividades:', error);
      throw error;
    }

    console.log('[CONSULTOR API] Dados recebidos:', data ? data.length : 0, 'registros');
    
    // Mesclar os dados recebidos com o mapa inicial
    if (data && data.length > 0) {
      data.forEach(item => {
        // A data vem como string no formato 'YYYY-MM-DD'
        const dateKey = item.dia.split('T')[0]; // Garantir formato YYYY-MM-DD
        
        if (initialData[dateKey]) {
          // Atualizar o registro existente com os dados da consulta
          initialData[dateKey] = {
            ...initialData[dateKey],
            tentativa_contato: item.tentativa_contato || 0,
            contato_efetivo: item.contato_efetivo || 0,
            atendimento_agendado: item.atendimento_agendado || 0,
            atendimento_realizado: item.atendimento_realizado || 0,
            matriculas: item.matriculas || 0
          };
        }
      });
    }
    
    // Converter o mapa para um array ordenado por data
    const result = Object.values(initialData).sort((a, b) => 
      new Date(a.dia).getTime() - new Date(b.dia).getTime()
    );
    
    console.log('[CONSULTOR API] Dados finais processados:', result.length, 'dias');
    console.timeEnd('[CONSULTOR API] Tempo de execução');
    
    return result;
  } catch (error) {
    console.error('[CONSULTOR API] Erro na função fetchConsultorActivities:', error);
    console.timeEnd('[CONSULTOR API] Tempo de execução');
    throw error;
  }
}
