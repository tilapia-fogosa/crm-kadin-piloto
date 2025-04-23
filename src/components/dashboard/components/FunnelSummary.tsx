
import React from 'react';
import { FunnelArrow } from './FunnelArrow';

interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
  stageConversionRate?: number;
}

interface FunnelSummaryProps {
  data: FunnelDataItem[];
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
}

/**
 * Componente que renderiza um resumo das estatísticas do funil
 * Exibe um grid com todas as etapas do funil e seus valores
 * Inclui setas entre as etapas mostrando a taxa de conversão entre elas
 * Utiliza a escala de laranja para cada estágio
 */
export const FunnelSummary: React.FC<FunnelSummaryProps> = ({ 
  data, 
  formatNumber, 
  formatPercent 
}) => {
  console.log("Renderizando FunnelSummary com dados:", data);
  
  // Verificação de segurança: se os dados não existirem, retornamos null
  if (!data || data.length === 0) {
    console.log("Nenhum dado disponível para renderizar o resumo do funil");
    return null;
  }
  
  return (
    <div className="flex items-center justify-between mt-16 p-2 bg-white rounded-md shadow-sm">
      {data.map((item, index) => (
        <React.Fragment key={index}>
          {/* Bloco de estatísticas da etapa */}
          <div className="text-center p-2">
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
          
          {/* Seta de conversão entre etapas (não mostrar após o último item) */}
          {index < data.length - 1 && (
            <FunnelArrow 
              conversionRate={data[index + 1].stageConversionRate || 0} 
              color={data[index + 1].color} 
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
