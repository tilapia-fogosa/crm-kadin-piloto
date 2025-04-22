
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { PainelFilters } from './PainelFilters';
import { ActivityTable } from './ActivityTable';
import { fetchConsultorActivities } from './services/consultorActivities';
import { useUserUnit } from '@/components/kanban/hooks/useUserUnit';

/**
 * Interface para as props do componente ConsultorDailyPanel
 */
interface ConsultorDailyPanelProps {
  userId?: string;
}

/**
 * Componente principal do painel de atividades diárias do consultor
 * 
 * Responsável por gerenciar os filtros e carregar os dados das atividades
 */
export function ConsultorDailyPanel({ userId }: ConsultorDailyPanelProps) {
  console.log('[CONSULTOR PANEL] Inicializando componente com userId:', userId);
  
  // Inicializar com o mês e ano atuais
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear().toString();
  
  // Estados para os filtros selecionados
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  
  // Hook para obter as unidades do usuário
  const { data: userUnits, isLoading: unitsLoading } = useUserUnit();
  
  // Efeito para definir as unidades padrão após carregamento
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && selectedUnitIds.length === 0) {
      // Define todas as unidades do usuário como selecionadas por padrão
      const allUnitIds = userUnits.map(unit => unit.unit_id);
      console.log('[CONSULTOR PANEL] Definindo unidades padrão:', allUnitIds);
      setSelectedUnitIds(allUnitIds);
    }
  }, [userUnits]);

  // Query para buscar as atividades com base nos filtros
  const { 
    data: activityData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['consultor-activities', selectedMonth, selectedYear, selectedUnitIds],
    queryFn: () => fetchConsultorActivities(
      userId || '',
      parseInt(selectedMonth), 
      parseInt(selectedYear), 
      selectedUnitIds
    ),
    enabled: !!userId && selectedUnitIds.length > 0,
  });

  // Log para depuração
  console.log('[CONSULTOR PANEL] Estado atual:', {
    selectedMonth,
    selectedYear,
    selectedUnitIds,
    dataCarregada: activityData ? true : false,
    isLoading,
    isError
  });

  // Quando os filtros mudam, refetch os dados
  useEffect(() => {
    if (userId && selectedUnitIds.length > 0) {
      console.log('[CONSULTOR PANEL] Filtros modificados, recarregando dados');
      refetch();
    }
  }, [selectedMonth, selectedYear, selectedUnitIds]);

  return (
    <div className="space-y-6">
      {/* Componente de filtros */}
      <PainelFilters
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedUnitIds={selectedUnitIds}
        setSelectedUnitIds={setSelectedUnitIds}
        userUnits={userUnits || []}
        isLoading={unitsLoading}
      />
      
      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando atividades...</span>
        </div>
      )}
      
      {/* Estado de erro */}
      {isError && (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
          <p>Erro ao carregar dados: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        </div>
      )}
      
      {/* Tabela de dados */}
      {!isLoading && !isError && activityData && (
        <ActivityTable 
          data={activityData} 
          selectedMonth={parseInt(selectedMonth)}
          selectedYear={parseInt(selectedYear)}
        />
      )}
    </div>
  );
}
