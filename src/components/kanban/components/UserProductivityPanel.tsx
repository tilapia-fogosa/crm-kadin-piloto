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
import { UserProductivityFilter } from "./UserProductivityFilter";

interface UnitUser {
  id: string;
  full_name: string;
}

interface UserProductivityPanelProps {
  stats?: ProductivityStats;
  isLoading: boolean;
  canFilterByUsers: boolean;
  selectedUserIds: string[];
  onUsersChange: (userIds: string[]) => void;
  availableUsers: UnitUser[];
}

export function UserProductivityPanel({ 
  stats, 
  isLoading, 
  canFilterByUsers,
  selectedUserIds,
  onUsersChange,
  availableUsers,
}: UserProductivityPanelProps) {
  console.log('📊 [UserProductivityPanel] canFilterByUsers:', canFilterByUsers);
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
        <div className={canFilterByUsers ? "grid grid-cols-[200px_1fr] gap-4" : ""}>
          {/* Coluna esquerda: Filtro (apenas para franqueados/admins) */}
          {canFilterByUsers && (
            <div className="flex flex-col">
              <UserProductivityFilter
                selectedUserIds={selectedUserIds}
                onUsersChange={onUsersChange}
                availableUsers={availableUsers}
              />
            </div>
          )}

          {/* Coluna direita: Tabela */}
          <div>
            {/* Header da tabela - colunas fixas de 60px */}
            <div className="grid grid-cols-[60px_60px_60px_60px] gap-2 mb-2">
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
                <div key={period.key} className="grid grid-cols-[60px_60px_60px_60px_auto] gap-2">
                  {/* Colunas de valores TC, CE, AG, AT */}
                  {activityColumns.map((col) => (
                    <div
                      key={col.key}
                      className="text-center bg-white/10 rounded px-2 py-1 text-xs font-medium text-white"
                    >
                      {renderValue(stats?.[col.key]?.[period.key])}
                    </div>
                  ))}

                  {/* Label do período à direita */}
                  <div className="text-xs font-medium text-white/70 flex items-center ml-2">
                    {period.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
