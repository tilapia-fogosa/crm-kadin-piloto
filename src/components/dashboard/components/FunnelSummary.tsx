
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
 */
export const FunnelSummary: React.FC<FunnelSummaryProps> = ({ 
  data, 
  formatNumber, 
  formatPercent 
}) => {
  console.log("Renderizando FunnelSummary com dados:", data);
  
  return (
    <div className="grid grid-cols-5 gap-4 mt-16 p-2 bg-slate-50 rounded-md">
      {data.map((item, index) => (
        <div key={index} className="text-center p-2 border-r last:border-r-0 border-slate-200">
          <div className="text-sm font-medium">{item.legenda}</div>
          <div className="text-lg font-bold">{formatNumber(item.valor)}</div>
          <div className="text-xs text-muted-foreground">{formatPercent(item.taxa)}</div>
        </div>
      ))}
    </div>
  );
};
