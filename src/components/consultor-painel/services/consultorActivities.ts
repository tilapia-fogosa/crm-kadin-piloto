
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
    
    // Executar a consulta Supabase (usando função SQL personalizada)
    // Aqui estamos usando o método fetchDailyActivities para contornar a limitação de RPC
    const result = await fetchDailyActivities(
      userId,
      selectedMonth,
      selectedYear,
      selectedUnitIds
    );
    
    console.log('[CONSULTOR API] Dados recebidos:', result ? result.length : 0, 'registros');
    
    // Mesclar os dados recebidos com o mapa inicial
    if (result && result.length > 0) {
      result.forEach(item => {
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

/**
 * Função para buscar dados de atividades diárias
 * Implementa a lógica de consulta SQL diretamente via Supabase query
 * 
 * @param userId - ID do usuário 
 * @param month - Mês selecionado
 * @param year - Ano selecionado
 * @param unitIds - IDs das unidades
 * @returns Array de atividades diárias (API format)
 */
async function fetchDailyActivities(
  userId: string,
  month: number,
  year: number,
  unitIds: string[]
): Promise<ApiDailyActivityData[]> {
  console.log('[CONSULTOR API] Executando consulta SQL para atividades diárias');
  
  try {
    // Construir a primeira parte da consulta - selecionando dias do mês
    const firstDayOfMonth = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(year, month, 0).toISOString().split('T')[0];
    
    // Consulta usando SQL direto em vez de RPC
    const { data, error } = await supabase
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
      .in('unit_id', unitIds)
      .gte('created_at', firstDayOfMonth)
      .lte('created_at', `${lastDayOfMonth}T23:59:59`)
      .eq('clients.active', true);
    
    if (error) {
      console.error('[CONSULTOR API] Erro na consulta SQL:', error);
      throw error;
    }
    
    // Processamento dos dados para o formato esperado
    console.log('[CONSULTOR API] Processando dados brutos:', data ? data.length : 0, 'registros');
    
    // Agrupar por dia
    const activityByDay: Record<string, ApiDailyActivityData> = {};
    
    if (data && data.length > 0) {
      data.forEach(item => {
        // Extrair a data no formato YYYY-MM-DD
        const day = item.created_at.split('T')[0];
        
        // Inicializar o dia se ainda não existir
        if (!activityByDay[day]) {
          activityByDay[day] = {
            dia: day,
            tentativa_contato: 0,
            contato_efetivo: 0,
            atendimento_agendado: 0,
            atendimento_realizado: 0,
            matriculas: 0
          };
        }
        
        // Incrementar o contador apropriado
        switch (item.tipo_atividade) {
          case 'Tentativa de Contato':
            activityByDay[day].tentativa_contato++;
            break;
          case 'Contato Efetivo':
            activityByDay[day].contato_efetivo++;
            break;
          case 'Agendamento':
            activityByDay[day].atendimento_agendado++;
            break;
          case 'Atendimento':
            activityByDay[day].atendimento_realizado++;
            break;
          case 'Matrícula':
            activityByDay[day].matriculas++;
            break;
        }
      });
    }
    
    return Object.values(activityByDay);
  } catch (error) {
    console.error('[CONSULTOR API] Erro ao buscar atividades diárias:', error);
    throw error;
  }
}
