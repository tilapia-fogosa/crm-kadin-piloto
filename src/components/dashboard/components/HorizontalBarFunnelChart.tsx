
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ReferenceLine
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
  
  // IMPORTANTE: Removemos o .reverse() que estava invertendo a ordem do funil
  // Mantemos a ordem original dos dados para apresentar corretamente o progresso do funil
  const chartData = [...data];
  
  // Calculamos o valor máximo para definir o domínio do eixo X
  const maxValue = Math.max(...chartData.map(item => item.valor));
  
  // Cores em gradiente para as barras (em tons de laranja)
  const barColors = [
    '#F97316', // Bright Orange para a primeira barra (Leads)
    '#FB923C', // Orange 400
    '#FD9D5E', // Orange 300 personalizado
    '#FDBA74', // Orange 200
    '#FED7AA'  // Orange 100
  ];
  
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 120, left: 160, bottom: 20 }}
          barCategoryGap={8} // Reduz o espaço entre as barras
        >
          {/* Linhas de grade horizontais em todo o gráfico, similar ao exemplo */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true} 
            vertical={false} 
            stroke="#e5e7eb" // Cor mais suave para as linhas
          />
          
          {/* Eixo X (valores numéricos) */}
          <XAxis 
            type="number" 
            tickFormatter={formatNumber}
            domain={[0, maxValue * 1.1]} // Adiciona 10% de espaço extra à direita
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          
          {/* Eixo Y (categorias/etapas do funil) */}
          <YAxis 
            dataKey="legenda" 
            type="category" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fontWeight: 500 }}
            width={150} // Mais espaço para as legendas
          />
          
          {/* Tooltip ao passar o mouse */}
          <Tooltip 
            formatter={(value) => [formatNumber(Number(value)), 'Total']}
            labelFormatter={(value) => `${value}`}
            contentStyle={{ fontSize: '12px' }}
          />
          
          {/* Adicionar linhas de referência verticais para melhorar a visualização */}
          {[0.25, 0.5, 0.75].map((ratio, index) => (
            <ReferenceLine 
              key={`ref-line-${index}`}
              x={maxValue * ratio} 
              stroke="#e5e7eb" 
              strokeDasharray="3 3" 
              ifOverflow="hidden"
            />
          ))}
          
          {/* Uma única barra para todas as etapas, cada uma com sua cor específica */}
          {chartData.map((item, index) => (
            <Bar 
              key={`bar-${index}`}
              dataKey="valor" 
              fill={barColors[index % barColors.length]} // Usar cores em tons de laranja
              radius={[0, 0, 0, 0]} // Remover bordas arredondadas
              barSize={22} // Barras mais finas, conforme solicitado
              isAnimationActive={true}
              name={item.legenda}
              data={[item]} // Cada barra usa apenas seu próprio item
            >
              <LabelList 
                dataKey="valor" 
                position="right" 
                formatter={formatNumber}
                style={{ 
                  fill: '#333', 
                  fontWeight: 'bold', 
                  fontSize: '12px' 
                }}
                offset={10} // Afasta os valores um pouco da barra
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
