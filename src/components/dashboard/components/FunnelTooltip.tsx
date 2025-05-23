
import React from 'react';

interface FunnelTooltipProps {
  active?: boolean;
  payload?: any[];
}

/**
 * Componente personalizado para o tooltip do funil de conversão
 * Exibe informações detalhadas quando o usuário passa o mouse sobre o gráfico
 * Utiliza a cor de cada etapa do funil para manter a consistência visual
 */
export const FunnelTooltip: React.FC<FunnelTooltipProps> = ({ active, payload }) => {
  // Log para depuração do tooltip
  console.log("Tooltip payload:", payload);
  
  if (active && payload && payload.length) {
    // O payload pode ser de qualquer item que tenha sido clicado no gráfico
    // Precisamos encontrar os dados originais do funil dentro dele
    let data = payload[0].payload;
    
    // Verificar se temos dados válidos no payload
    if (!data || !data.legenda) {
      console.log("Dados inválidos no tooltip:", data);
      return null;
    }
    
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-bold" style={{ color: data.color }}>{data.legenda}</p>
        <p className="text-sm text-gray-600">Quantidade: <span className="font-medium" style={{ color: data.color }}>{data.valor}</span></p>
        <p className="text-sm text-gray-600">Taxa de Conversão: <span className="font-medium" style={{ color: data.color }}>{data.taxa.toFixed(1)}%</span></p>
      </div>
    );
  }

  return null;
};
