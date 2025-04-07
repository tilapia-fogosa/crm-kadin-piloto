
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
            domain={[0, 4]} 
            hide 
          />
          <RechartsTooltip content={<FunnelTooltip />} />
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-left-${index}`} id={`gradientLeft${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.8} />
              </linearGradient>
            ))}
            {data.map((entry, index) => (
              <linearGradient key={`gradient-right-${index}`} id={`gradientRight${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          
          {/* Mapeia cada etapa do funil com seu respectivo gradiente */}
          {data.map((item, index) => (
            <React.Fragment key={`area-${index}`}>
              {/* Lado esquerdo do funil */}
              <Area 
                dataKey="valueLeft" 
                stackId="1" 
                stroke="none" 
                isAnimationActive={true}
                fill={`url(#gradientLeft${index})`}
                name="Left"
                fillOpacity={1}
                filter={index === data.length - 1 ? "none" : undefined}
              />
              {/* Lado direito do funil */}
              <Area 
                dataKey="valueRight" 
                stackId="1" 
                stroke="none" 
                isAnimationActive={true}
                fill={`url(#gradientRight${index})`}
                name="Right"
                fillOpacity={1}
                filter={index === data.length - 1 ? "none" : undefined}
              />
            </React.Fragment>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
