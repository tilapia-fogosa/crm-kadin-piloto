/**
 * LOG: Hook para recálculo automático de comissões
 * DESCRIÇÃO: Dispara recálculo automático dos últimos 6 meses quando componente monta
 * OTIMIZAÇÃO: Usa debounce de 10 segundos para evitar recálculos excessivos
 */

import { useEffect, useRef } from 'react';
import { useCalculateCommission } from '@/hooks/useCommissionCalculations';
import { useDebounce } from '@/components/kanban/utils/hooks/useDebounce';
import { format, subMonths } from 'date-fns';

interface UseAutoRecalculateParams {
  unitId: string;
  consultantId: string | null;
  enabled?: boolean;
}

/**
 * Hook para auto-recálculo de comissões ao montar componente
 * 
 * COMPORTAMENTO:
 * 1. Dispara recálculo automático dos últimos 6 meses
 * 2. Usa debounce de 10 segundos para evitar múltiplas chamadas
 * 3. Só executa quando unitId e consultantId mudam
 * 4. Force recalculate = true para garantir dados atualizados
 * 
 * @param unitId - ID da unidade
 * @param consultantId - ID do consultor (null para todos)
 * @param enabled - Se o recálculo está habilitado (padrão: true)
 */
export function useAutoRecalculateCommissions({
  unitId,
  consultantId,
  enabled = true
}: UseAutoRecalculateParams) {
  const calculateCommission = useCalculateCommission();
  const hasRecalculated = useRef(false);
  
  // Criar chave única para debounce baseada nos parâmetros
  const recalculateKey = `${unitId}-${consultantId}`;
  const debouncedKey = useDebounce(recalculateKey, 10000); // 10 segundos de debounce
  
  useEffect(() => {
    // LOG: Verificar se deve recalcular
    if (!enabled || !unitId) {
      console.log('LOG: Auto-recálculo desabilitado ou sem unidade', { enabled, unitId });
      return;
    }

    // Se já recalculou para esta combinação, não recalcular novamente
    if (hasRecalculated.current) {
      console.log('LOG: Aguardando debounce de 10 segundos...');
      return;
    }

    console.log('LOG: Iniciando auto-recálculo de comissões', {
      unitId,
      consultantId,
      debouncedKey
    });

    // Calcular últimos 6 meses
    const months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      months.push(format(date, 'yyyy-MM'));
    }

    console.log('LOG: Meses a recalcular:', months);

    // Recalcular cada mês com force_recalculate = true
    months.forEach((month, index) => {
      // Se consultantId for null, não faz sentido tentar calcular
      // (a RPC precisa de consultor específico)
      if (!consultantId) {
        console.log('LOG: Pulando recálculo do mês', month, '- consultor não selecionado');
        return;
      }

      // Delay escalonado para evitar sobrecarga (100ms entre cada)
      setTimeout(() => {
        console.log(`LOG: [${index + 1}/${months.length}] Recalculando mês ${month}`, {
          unitId,
          consultantId,
          month,
          forceRecalculate: true
        });

        calculateCommission.mutate({
          unitId,
          consultantId,
          month,
          forceRecalculate: true
        });
      }, index * 100);
    });

    // Marcar como recalculado para evitar loops
    hasRecalculated.current = true;

    // Limpar flag após 10 segundos (debounce)
    const resetTimer = setTimeout(() => {
      console.log('LOG: Reset de flag de recálculo após debounce');
      hasRecalculated.current = false;
    }, 10000);

    return () => {
      clearTimeout(resetTimer);
    };
  }, [debouncedKey, enabled]); // Só re-executa quando debouncedKey muda

  return {
    isRecalculating: calculateCommission.isPending,
    recalculateError: calculateCommission.error
  };
}
