
import React from 'react';

interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
}

interface FunnelSummaryProps {
  data: FunnelDataItem[];
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
}

/**
 * Componente que renderiza um resumo das estatísticas do funil
 * Exibe um grid com todas as etapas do funil e seus valores
 * Utiliza a paleta de laranja para cada estágio
 */
export const FunnelSummary: React.FC<FunnelSummaryProps> = ({ 
  data, 
  formatNumber, 
  formatPercent 
}) => {
  console.log("Renderizando FunnelSummary com dados:", data);
  
  return (
    <div className="grid grid-cols-5 gap-4 mt-16 p-2 bg-white rounded-md shadow-sm">
      {data.map((item, index) => (
        <div key={index} className="text-center p-2 border-r last:border-r-0 border-slate-200">
          <div 
            className="text-sm font-medium"
            style={{ color: item.color }}
          >
            {item.legenda}
          </div>
          <div className="text-lg font-bold" style={{ color: item.color }}>
            {formatNumber(item.valor)}
          </div>
          <div className="text-xs" style={{ color: item.color, opacity: 0.8 }}>
            {formatPercent(item.taxa)}
          </div>
        </div>
      ))}
    </div>
  );
};
