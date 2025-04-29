
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from 'recharts';

interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
}

interface HorizontalBarFunnelChartProps {
  data: FunnelDataItem[];
  formatNumber: (value: number) => string;
}

/**
 * Componente que renderiza um gráfico de barras horizontais para o funil de conversão
 * Utiliza a biblioteca Recharts com BarChart e layout vertical
 * Cada barra representa uma etapa do funil com sua respectiva cor
 */
export const HorizontalBarFunnelChart: React.FC<HorizontalBarFunnelChartProps> = ({ 
  data,
  formatNumber
}) => {
  console.log('Renderizando HorizontalBarFunnelChart com dados:', data);
  
  // Verificação de segurança para evitar erros
  if (!data || data.length === 0) {
    console.log('Sem dados para renderizar o gráfico de barras horizontal');
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p>Sem dados disponíveis para exibir</p>
      </div>
    );
  }
  
  // Ordenar os dados para que os valores mais altos fiquem no topo
  // Isso é importante para a visualização do funil em ordem decrescente
  const chartData = [...data].reverse();
  
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 50, left: 140, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={formatNumber}
            domain={[0, 'dataMax']}
          />
          <YAxis 
            dataKey="legenda" 
            type="category" 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value) => [formatNumber(Number(value)), 'Total']}
            labelFormatter={(value) => `${value}`}
          />
          
          {/* Renderizar uma barra para cada item do funil */}
          {chartData.map((item, index) => (
            <Bar 
              key={`bar-${index}`}
              dataKey="valor" 
              fill={item.color}
              radius={[0, 4, 4, 0]}
              barSize={30}
              isAnimationActive={true}
              data={[item]}
            >
              <LabelList 
                dataKey="valor" 
                position="right" 
                formatter={formatNumber}
                style={{ fill: '#333', fontWeight: 'bold', fontSize: '12px' }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
