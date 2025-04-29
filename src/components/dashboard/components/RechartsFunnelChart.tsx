
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
 * Componente que renderiza um gráfico de funil horizontal com o Recharts
 * Seguindo a documentação oficial do Recharts para FunnelChart
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
  
  // Preparamos os dados para o formato aceito pelo Recharts FunnelChart
  const formattedData = data.map(item => ({
    name: item.name,
    value: item.valor,
    fill: item.color,
    legenda: item.legenda,
    taxa: item.taxa,
    stageConversionRate: item.stageConversionRate
  }));
  
  console.log('Dados formatados para o funil:', formattedData);
  
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        {/* Configurando o FunnelChart com layout horizontal */}
        <FunnelChart layout="horizontal" margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
          {/* Tooltip personalizado */}
          <Tooltip 
            content={<FunnelCustomTooltip 
              formatNumber={formatNumber} 
              formatPercent={formatPercent} 
            />} 
          />
          
          {/* Componente Funnel principal com orientação horizontal */}
          <Funnel
            dataKey="value"
            data={formattedData}
            isAnimationActive={true}
            orientation="horizontal"
            nameKey="legenda"
            width="80%"
            height="80%"
            lastShapeType="rectangle"  // Último elemento como retângulo
          >
            {/* Lista de rótulos à direita (valores) */}
            <LabelList
              position="right"
              dataKey="value"
              fill="#333"
              fontSize={12}
              fontWeight="bold"
              formatter={formatNumber}
              className="text-sm font-bold"
              offset={10}
            />
            
            {/* Células individuais com cores personalizadas */}
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
              />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};
