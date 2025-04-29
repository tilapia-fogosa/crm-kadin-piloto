
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, addMonths, subMonths, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useUserUnit } from "./useUserUnit";
import { ScheduledAppointment } from "../types";

export function useCalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit();
  
  // Modificado para usar array de IDs das unidades selecionadas
  const [selectedCalendarUnitIds, setSelectedCalendarUnitIds] = useState<string[]>([]);

  // Inicializar seleção de unidades quando as unidades são carregadas
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && selectedCalendarUnitIds.length === 0) {
      console.log('Inicializando seleção de unidades com todas as unidades disponíveis');
      // Por padrão, seleciona todas as unidades
      setSelectedCalendarUnitIds(userUnits.map(unit => unit.unit_id));
    }
  }, [userUnits, selectedCalendarUnitIds]);

  // Função para navegar para o mês anterior
  const handlePreviousMonth = () => {
    console.log('Navegando para o mês anterior');
    setCurrentDate(prev => subMonths(prev, 1));
  };

  // Função para navegar para o próximo mês
  const handleNextMonth = () => {
    console.log('Navegando para o próximo mês');
    setCurrentDate(prev => addMonths(prev, 1));
  };

  // Função para lidar com o reagendamento
  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('Iniciando reagendamento para:', clientName);
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setIsReschedulingDialogOpen(true);
  };

  const { data: scheduledAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['scheduled-appointments', format(currentDate, 'yyyy-MM'), selectedCalendarUnitIds, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      console.log('Buscando agendamentos para o mês:', format(currentDate, 'yyyy-MM'));
      console.log('Filtro de unidades selecionadas:', selectedCalendarUnitIds);
      
      // Usamos startOfMonth e endOfMonth da biblioteca date-fns para melhor precisão
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);
      
      // Logs detalhados para debugging
      console.log('Período de busca:', {
        inicio: format(startOfMonthDate, 'yyyy-MM-dd'),
        fim: format(endOfMonthDate, 'yyyy-MM-dd')
      });
      
      // Convertemos para string sem considerar fuso horário (apenas data)
      const startDateStr = format(startOfMonthDate, 'yyyy-MM-dd');
      const endDateStr = format(endOfMonthDate, 'yyyy-MM-dd') + 'T23:59:59';
      
      console.log('Strings de data usadas na consulta:', {
        inicio: startDateStr,
        fim: endDateStr
      });
      
      // Verificação de segurança para unidades indefinidas
      if (!userUnits || userUnits.length === 0) {
        console.log('Nenhuma unidade disponível para o usuário');
        return [];
      }
      
      const unitIds = userUnits.map(u => u.unit_id) || [];
      
      // Filtrar pelas unidades selecionadas ou por todas se nenhuma for selecionada
      const unitFilter = selectedCalendarUnitIds.length > 0
        ? selectedCalendarUnitIds
        : unitIds;
      
      console.log('Filtrando por unidades:', unitFilter);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          scheduled_date,
          status,
          unit_id,
          units (id, name)
        `)
        .eq('active', true)
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitFilter)
        .gte('scheduled_date', startDateStr)
        .lte('scheduled_date', endDateStr);

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        throw error;
      }

      console.log(`Total de agendamentos encontrados: ${data?.length || 0}`);
      
      // Verificar especificamente se há agendamentos para o dia 30
      const dia30 = data?.filter(item => {
        const dataAgendamento = new Date(item.scheduled_date);
        return dataAgendamento.getDate() === 30;
      });
      
      console.log(`Agendamentos para o dia 30: ${dia30?.length || 0}`);
      if (dia30?.length) {
        console.log('Detalhes dos agendamentos do dia 30:', dia30);
      }
      
      const appointments = data?.map(client => ({
        id: client.id,
        client_name: client.name,
        scheduled_date: client.scheduled_date,
        status: client.status,
        unit_id: client.unit_id,
        unit_name: client.units?.name
      })) || [];

      console.log('Agendamentos processados:', appointments);
      return appointments as ScheduledAppointment[];
    },
    refetchInterval: 5000,
    refetchOnMount: true,
    enabled: userUnits !== undefined && userUnits.length > 0
  });

  return {
    currentDate,
    isReschedulingDialogOpen,
    setIsReschedulingDialogOpen,
    selectedClientId,
    selectedClientName,
    userUnits,
    isLoadingUnits,
    selectedCalendarUnitIds,
    setSelectedCalendarUnitIds,
    handlePreviousMonth,
    handleNextMonth,
    handleReschedule,
    scheduledAppointments,
    isLoadingAppointments
  };
}
