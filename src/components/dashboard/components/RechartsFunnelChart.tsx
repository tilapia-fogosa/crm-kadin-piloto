
import React from 'react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  Cell,
  TooltipProps
} from 'recharts';

// Interface para os dados do funil
interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
  stageConversionRate?: number;
}

interface FunnelTooltipProps extends TooltipProps<number, string> {
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
}

// Componente de Tooltip personalizado
const FunnelCustomTooltip = ({ 
  active, 
  payload, 
  formatNumber, 
  formatPercent 
}: FunnelTooltipProps) => {
  // Log para rastrear os dados recebidos no tooltip
  console.log('FunnelTooltip - payload:', payload);
  
  if (active && payload && payload.length) {
    const data = payload[0].payload as FunnelDataItem;
    
    return (
      <div className="bg-white p-3 rounded-md border shadow-md text-sm">
        <p className="font-bold mb-1">{data.legenda}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <p>Total:</p>
          <p className="font-medium text-right">{formatNumber(data.valor)}</p>
          
          <p>Taxa Geral:</p>
          <p className="font-medium text-right">{formatPercent(data.taxa)}</p>
          
          {data.stageConversionRate !== undefined && (
            <>
              <p>Conversão da Etapa:</p>
              <p className="font-medium text-right">
                {formatPercent(data.stageConversionRate)}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

interface RechartsFunnelChartProps {
  data: FunnelDataItem[];
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
}

/**
 * Componente que renderiza um gráfico de funil com o Recharts
 * Projetado especificamente para visualização de funis de conversão
 */
export const RechartsFunnelChart: React.FC<RechartsFunnelChartProps> = ({
  data,
  formatNumber,
  formatPercent
}) => {
  console.log('Renderizando RechartsFunnelChart com dados:', data);
  
  // Verificação de segurança
  if (!data || data.length === 0) {
    console.log('Nenhum dado disponível para renderizar o funil');
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p>Sem dados disponíveis para exibir</p>
      </div>
    );
  }
  
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          {/* Tooltip personalizado */}
          <Tooltip 
            content={<FunnelCustomTooltip 
              formatNumber={formatNumber} 
              formatPercent={formatPercent} 
            />} 
          />
          
          {/* Componente Funnel principal */}
          <Funnel
            dataKey="valor"
            data={data}
            isAnimationActive={true}
            // Propriedades para ajustar a aparência do funil
            width="80%" 
            height="90%"
            nameKey="legenda"
            paddingAngle={2}
          >
            {/* Lista de rótulos à esquerda (etapa do funil) */}
            <LabelList
              position="left"
              dataKey="legenda"
              fill="#333"
              fontSize={12}
              fontWeight="500"
              stroke="none"
              className="text-sm font-medium"
            />
            
            {/* Lista de rótulos dentro das barras (valores) */}
            <LabelList
              position="center"
              dataKey="valor"
              fill="#fff"
              fontSize={12}
              fontWeight="bold"
              formatter={formatNumber}
              className="text-sm font-bold text-white"
            />
            
            {/* Células individuais com cores personalizadas */}
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};
