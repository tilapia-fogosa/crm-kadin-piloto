/**
 * Painel de Produtividade do Usuário
 * 
 * @description
 * Exibe estatísticas de produtividade (TC, CE, AG, AT) em formato de tabela
 * com médias diárias para períodos de 1, 3, 7 e 15 dias.
 * 
 * Layout:
 * - Coluna esquerda: Labels de período (Dia, 3D, 7D, 15D)
 * - Colunas seguintes: TC, CE, AG, AT com tooltips explicativos
 */

import { ProductivityStats } from "@/types/productivity.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserProductivityPanelProps {
  stats?: ProductivityStats;
  isLoading: boolean;
}

export function UserProductivityPanel({ stats, isLoading }: UserProductivityPanelProps) {
  console.log('📊 [UserProductivityPanel] Renderizando com stats:', stats);

  const activityColumns = [
    { key: 'tentativaContato' as const, label: 'TC', tooltip: 'Tentativa de Contato' },
    { key: 'contatoEfetivo' as const, label: 'CE', tooltip: 'Contato Efetivo' },
    { key: 'agendamento' as const, label: 'AG', tooltip: 'Agendamento' },
    { key: 'atendimento' as const, label: 'AT', tooltip: 'Atendimento' },
  ];

  const periods = [
    { key: 'day1' as const, label: 'Dia' },
    { key: 'day3' as const, label: '3D' },
    { key: 'day7' as const, label: '7D' },
    { key: 'day15' as const, label: '15D' },
  ];

  /**
   * Renderiza o valor de uma célula
   */
  const renderValue = (value?: number) => {
    if (isLoading) return '';
    if (value === undefined) return '0';
    return value.toString();
  };

  return (
    <TooltipProvider>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        {/* Header da tabela */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          <div className="text-xs font-medium text-white/70"></div>
          {activityColumns.map((col) => (
            <Tooltip key={col.key}>
              <TooltipTrigger asChild>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white bg-white/10 rounded px-2 py-1">
                    {col.label}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{col.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Linhas de dados */}
        <div className="space-y-1">
          {periods.map((period) => (
            <div key={period.key} className="grid grid-cols-5 gap-2">
              {/* Coluna de label do período */}
              <div className="text-xs font-medium text-white/90 flex items-center">
                {period.label}
              </div>

              {/* Colunas de valores */}
              {activityColumns.map((col) => (
                <div
                  key={col.key}
                  className="text-center bg-white/10 rounded px-2 py-1 text-xs font-medium text-white"
                >
                  {renderValue(stats?.[col.key]?.[period.key])}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
