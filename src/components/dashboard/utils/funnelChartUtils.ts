/**
 * Utilitários para processamento e transformação de dados para o gráfico de funil
 */

export interface FunnelDataItem {
  name: string;
  valor: number;
  taxa: number;
  legenda: string;
  color: string;
  stageConversionRate?: number; // Taxa de conversão em relação à etapa anterior
}

export interface SymmetricalFunnelDataItem extends FunnelDataItem {
  valueLeft?: number;
  valueRight?: number;
  step?: number;
}

/**
 * Função que gera um tom de laranja baseado no índice da etapa do funil
 * Quanto maior o índice, mais escuro o tom de laranja
 */
export const generateOrangeShade = (index: number, total: number): string => {
  console.log(`Gerando tom de laranja para índice ${index} de ${total}`);
  
  // Cor base - tom de laranja
  const baseColor = "#f97316";
  
  // Calculamos a intensidade do tom com base no índice (quanto maior o índice, mais escuro)
  // Usamos uma escala não linear para destacar melhor as diferenças entre etapas
  const darkenFactor = Math.pow((index / Math.max(total - 1, 1)), 1.5);
  
  // Converter a cor hex para RGB
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  // Escurecer proporcionalmente com base no fator calculado (máximo 60%)
  const darkenPercent = darkenFactor * 0.6;
  const newR = Math.floor(r * (1 - darkenPercent));
  const newG = Math.floor(g * (1 - darkenPercent));
  const newB = Math.floor(b * (1 - darkenPercent));
  
  // Converter de volta para hex
  const newColor = "#" + 
    newR.toString(16).padStart(2, '0') + 
    newG.toString(16).padStart(2, '0') + 
    newB.toString(16).padStart(2, '0');
  
  console.log(`Cor gerada para índice ${index}: ${newColor}`);
  
  return newColor;
};

/**
 * Prepara os dados básicos para o gráfico de funil com base nas estatísticas recebidas
 */
export const prepareBasicFunnelData = (funnelStats: any): FunnelDataItem[] => {
  if (!funnelStats) return [];
  
  console.log("Preparando dados básicos para o funil:", funnelStats);
  
  const totalItems = 5; // Total de etapas no funil
  
  // Criamos o array de dados para o funil com a escala de laranja
  const data: FunnelDataItem[] = [
    {
      name: 'Leads',
      valor: funnelStats.totalLeads,
      taxa: 100,
      legenda: 'Leads Recebidos',
      color: generateOrangeShade(0, totalItems),
      stageConversionRate: undefined
    },
    {
      name: 'Contatos',
      valor: funnelStats.effectiveContacts,
      taxa: funnelStats.effectiveContactRate,
      legenda: 'Contatos Efetivos',
      color: generateOrangeShade(1, totalItems),
      stageConversionRate: undefined
    },
    {
      name: 'Agendamentos',
      valor: funnelStats.scheduledVisits,
      taxa: funnelStats.scheduledVisitsRate,
      legenda: 'Agendamentos',
      color: generateOrangeShade(2, totalItems),
      stageConversionRate: undefined
    },
    {
      name: 'Atendimentos',
      valor: funnelStats.completedVisits,
      taxa: funnelStats.completedVisitsRate,
      legenda: 'Atendimentos',
      color: generateOrangeShade(3, totalItems),
      stageConversionRate: undefined
    },
    {
      name: 'Matrículas',
      valor: funnelStats.enrollments,
      taxa: funnelStats.enrollmentsRate,
      legenda: 'Matrículas',
      color: generateOrangeShade(4, totalItems),
      stageConversionRate: undefined
    }
  ];
  
  // Calcular a taxa de conversão entre etapas
  for (let i = 1; i < data.length; i++) {
    const previousStageValue = data[i-1].valor;
    const currentStageValue = data[i].valor;
    
    // Evitar divisão por zero
    if (previousStageValue > 0) {
      data[i].stageConversionRate = (currentStageValue / previousStageValue) * 100;
      console.log(`Taxa de conversão de ${data[i-1].name} para ${data[i].name}: ${data[i].stageConversionRate?.toFixed(1)}%`);
    } else {
      data[i].stageConversionRate = 0;
    }
  }
  
  return data;
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
    // Calculamos a largura relativa ao valor máximo (0-100)
    const funnelWidth = (item.valor / maxValue) * 100;
    
    return {
      ...item,
      // Centralizamos o funil (metade da largura em cada lado)
      valueRight: funnelWidth,
      // Índice para posicionamento vertical
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
