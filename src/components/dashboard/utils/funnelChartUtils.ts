
/**
 * Utilitários para processamento e transformação de dados para o gráfico de funil
 */

export interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
}

export interface SymmetricalFunnelDataItem extends FunnelDataItem {
  left?: number;
  right?: number;
  valueLeft?: number;
  valueRight?: number;
  step?: number;
}

/**
 * Prepara os dados básicos para o gráfico de funil com base nas estatísticas recebidas
 */
export const prepareBasicFunnelData = (funnelStats: any): FunnelDataItem[] => {
  if (!funnelStats) return [];
  
  console.log("Preparando dados básicos para o funil:", funnelStats);
  
  // Criamos o array de dados para o funil
  return [
    {
      name: 'Leads',
      valor: funnelStats.totalLeads,
      taxa: 100,
      legenda: 'Leads Recebidos',
      color: "#3b82f6"
    },
    {
      name: 'Contatos',
      valor: funnelStats.effectiveContacts,
      taxa: funnelStats.effectiveContactRate,
      legenda: 'Contatos Efetivos',
      color: "#10b981"
    },
    {
      name: 'Agendamentos',
      valor: funnelStats.scheduledVisits,
      taxa: funnelStats.scheduledVisitsRate,
      legenda: 'Agendamentos',
      color: "#f59e0b"
    },
    {
      name: 'Atendimentos',
      valor: funnelStats.completedVisits,
      taxa: funnelStats.completedVisitsRate,
      legenda: 'Atendimentos',
      color: "#6366f1"
    },
    {
      name: 'Matrículas',
      valor: funnelStats.enrollments,
      taxa: funnelStats.enrollmentsRate,
      legenda: 'Matrículas',
      color: "#ec4899"
    }
  ];
};

/**
 * Transforma os dados para renderizar o funil simétrico
 * Calcula a largura de cada barra com base no valor e no valor máximo
 */
export const transformDataForSymmetricalFunnel = (data: FunnelDataItem[]): SymmetricalFunnelDataItem[] => {
  console.log("Transformando dados para funil simétrico:", data);
  
  // Valor máximo para dimensionar o funil
  const maxValue = Math.max(...data.map(item => item.valor)) * 1.2;
  
  return data.map((item, index) => {
    // Calculamos a largura relativa ao valor máximo
    const funnelWidth = (item.valor / maxValue) * 100;
    
    return {
      ...item,
      // Valores para a área esquerda e direita do funil (simétrico)
      left: (100 - funnelWidth) / 2,
      right: (100 - funnelWidth) / 2 + funnelWidth,
      // Para uso no gráfico de área
      valueLeft: (100 - funnelWidth) / 2,
      valueRight: funnelWidth,
      // Para identificar posição no funil
      step: index
    };
  });
};

/**
 * Formata um número para exibição localizada
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

/**
 * Formata uma porcentagem para exibição
 */
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
