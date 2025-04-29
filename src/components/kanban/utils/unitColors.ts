
/**
 * Função para gerar uma cor para uma unidade com base no índice
 * Cores são selecionadas para ter bom contraste e serem visualmente agradáveis
 */
export const getUnitColor = (index: number): string => {
  // Paleta de cores para unidades (16 cores)
  const colors = [
    '#4361ee', // Azul principal
    '#ef476f', // Rosa
    '#06d6a0', // Verde turquesa
    '#ffd166', // Amarelo
    '#118ab2', // Azul escuro
    '#ff9f1c', // Laranja
    '#7209b7', // Roxo
    '#2b9348', // Verde
    '#e07a5f', // Terracota
    '#3a86ff', // Azul claro
    '#bc4749', // Vermelho escuro
    '#0077b6', // Azul marinho
    '#fb8500', // Laranja escuro
    '#7b2cbf', // Violeta
    '#3f8efc', // Azul médio
    '#55a630'  // Verde limão
  ];
  
  // Para garantir que sempre tenhamos uma cor, mesmo com mais de 16 unidades
  return colors[index % colors.length];
};

/**
 * Determina se o texto deve ser branco ou preto com base na cor de fundo
 * para garantir contraste adequado
 */
export const shouldUseWhiteText = (bgColor: string): boolean => {
  // Remove o # se presente
  const color = bgColor.startsWith('#') ? bgColor.slice(1) : bgColor;
  
  // Converte para RGB
  const r = parseInt(color.slice(0, 2), 16) || 0;
  const g = parseInt(color.slice(2, 4), 16) || 0;
  const b = parseInt(color.slice(4, 6), 16) || 0;
  
  // Cálculo de luminância (simplificado)
  // Fonte: https://www.w3.org/TR/WCAG20-TECHS/G17.html
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna true (texto branco) para cores escuras, false (texto preto) para cores claras
  return luminance < 0.5;
};
