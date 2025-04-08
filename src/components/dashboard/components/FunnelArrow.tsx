
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FunnelArrowProps {
  conversionRate: number;
  color: string;
}

/**
 * Componente que renderiza uma seta com a taxa de conversão entre duas etapas do funil
 * Exibe um ícone de seta e a porcentagem de conversão
 */
export const FunnelArrow: React.FC<FunnelArrowProps> = ({ 
  conversionRate, 
  color 
}) => {
  console.log("Renderizando FunnelArrow com taxa:", conversionRate);
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <ChevronRight 
            className="h-6 w-6" 
            style={{ color }}
          />
        </div>
        <div 
          className="text-xs font-medium -mt-1" 
          style={{ color }}
        >
          {conversionRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
