
/**
 * Utilitário para gerenciar as cores das unidades
 * 
 * As cores são atribuídas seguindo uma ordem de prioridade:
 * 1. Cores laranja (identidade principal)
 * 2. Cores roxas (identidade secundária)
 * 3. Outras cores para diversificação
 */

// Paleta de cores com prioridade para laranja/roxo
const unitColorPalette = [
  '#ff7b00', // laranja
  '#ff9a3c', // laranja claro
  '#d15d27', // laranja escuro
  '#9c27b0', // roxo
  '#ba68c8', // roxo médio
  '#7b1fa2', // roxo escuro
  '#3f51b5', // índigo
  '#2196f3', // azul
  '#4caf50', // verde
  '#f44336'  // vermelho
];

/**
 * Obtém a cor para uma unidade com base em seu índice na lista de unidades
 * @param index Índice da unidade na lista
 * @returns Código de cor hexadecimal
 */
export function getUnitColor(index: number): string {
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
  
  // Converte de hexadecimal para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcula a luminosidade (fórmula YIQ)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Se YIQ < 128, a cor é escura e deve usar texto branco
  return yiq < 128;
}
