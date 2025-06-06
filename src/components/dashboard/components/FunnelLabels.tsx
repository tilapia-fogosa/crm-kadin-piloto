
import React from 'react';

interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
}

interface FunnelLabelsProps {
  data: FunnelDataItem[];
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
}

/**
 * Componente que renderiza os rótulos à esquerda e direita do funil
 * Exibe o nome da etapa e os valores de conversão utilizando a escala de laranja
 */
export const FunnelLabels: React.FC<FunnelLabelsProps> = ({ 
  data, 
  formatNumber, 
  formatPercent 
}) => {
  console.log("Renderizando FunnelLabels com dados:", data);
  
  // Calculamos o espaçamento vertical baseado no número de etapas
  const verticalSpacing = 320 / (data.length + 1);
  const topOffset = 15; // Um pequeno offset inicial
  
  return (
    <div className="relative -mt-[350px] h-[350px] pointer-events-none">
      {data.map((item, index) => (
        <div 
          key={index} 
          className="absolute flex justify-between w-full px-8"
          style={{ 
            top: `${topOffset + (index * verticalSpacing)}px`, 
          }}
        >
          {/* Label esquerdo */}
          <div className="text-right">
            <span className="font-bold" style={{ color: item.color }}>{item.legenda}</span>
          </div>
          
          {/* Label direito com números */}
          <div className="text-left">
            <span className="font-bold" style={{ color: item.color }}>
              {formatNumber(item.valor)} <span className="text-sm">({formatPercent(item.taxa)})</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
