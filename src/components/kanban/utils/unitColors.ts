
/**
 * Utilitário para gerenciar as cores das unidades
 * 
 * As cores são atribuídas seguindo uma ordem de prioridade:
 * 1. Cores laranja (identidade principal)
 * 2. Cores roxas (identidade secundária)
 * 3. Outras cores para diversificação
 */

// Paleta de cores com prioridade para laranja/roxo (expansão para 10 cores sem repetição)
const unitColorPalette = [
  '#ff7b00', // laranja principal
  '#9b87f5', // roxo principal
  '#ff9a3c', // laranja claro
  '#7E69AB', // roxo secundário
  '#d15d27', // laranja escuro
  '#8B5CF6', // roxo vivido
  '#0EA5E9', // azul oceano
  '#10B981', // verde esmeralda
  '#F97316', // laranja vivo
  '#6366F1'  // índigo
];

/**
 * Obtém a cor para uma unidade com base em seu índice na lista de unidades
 * @param index Índice da unidade na lista
 * @returns Código de cor hexadecimal
 */
export function getUnitColor(index: number): string {
  // Verificação de segurança para índice negativo
  if (index < 0) {
    console.log('Índice negativo fornecido para getUnitColor:', index);
    index = 0;
  }
  
  console.log('Atribuindo cor para índice:', index);
  return unitColorPalette[index % unitColorPalette.length];
}

/**
 * Verifica se a cor de fundo é escura para determinar a cor do texto
 * @param backgroundColor Código de cor hexadecimal do fundo
 * @returns Verdadeiro se deve usar texto claro (branco)
 */
export function shouldUseWhiteText(backgroundColor: string): boolean {
  // Remove o caractere # se estiver presente
  const hex = backgroundColor.replace('#', '');
  
  // Verificação de segurança para hex inválido
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.log('Código de cor hexadecimal inválido:', backgroundColor);
    return false;
  }
  
  // Converte de hexadecimal para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcula a luminosidade (fórmula YIQ)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Se YIQ < 128, a cor é escura e deve usar texto branco
  return yiq < 128;
}
