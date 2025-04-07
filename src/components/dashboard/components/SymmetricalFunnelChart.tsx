
import React from 'react';
import { 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import { FunnelTooltip } from './FunnelTooltip';

interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
  valueLeft?: number;
  valueRight?: number;
  step?: number;
}

interface SymmetricalFunnelChartProps {
  data: FunnelDataItem[];
}

/**
 * Componente que renderiza um gráfico de funil simétrico usando áreas do Recharts
 * O funil é criado usando duas áreas espelhadas para criar o efeito visual
 * Utiliza tons de laranja para representar cada estágio do funil
 */
export const SymmetricalFunnelChart: React.FC<SymmetricalFunnelChartProps> = ({ data }) => {
  console.log("Renderizando SymmetricalFunnelChart com dados:", data);
  
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
          layout="vertical"
        >
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            hide 
          />
          <YAxis 
            dataKey="step" 
            type="number" 
            domain={[0, data.length - 1]} 
            hide 
          />
          <RechartsTooltip content={<FunnelTooltip />} />
          
          {/* Definir gradientes para cada etapa do funil */}
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0} />
                <stop offset="50%" stopColor={entry.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          
          {/* Renderizar cada etapa do funil como uma área única */}
          {data.map((_, index) => (
            <Area 
              key={`area-${index}`}
              dataKey={`valueRight`}
              stackId="1"
              stroke="none"
              fill={`url(#gradient${index})`}
              fillOpacity={1}
              isAnimationActive={true}
              data={[data[index]]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
