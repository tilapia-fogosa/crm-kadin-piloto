
/**
 * Utilitários para manipulação de datas
 * Inclui funções para parsing, formatação e normalização de datas
 */

export const parseFormDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  // Criar uma nova instância de Data
  const date = new Date(dateString);
  console.log(`parseFormDate: Convertendo "${dateString}" para Data: ${date.toISOString()}`);
  return isNaN(date.getTime()) ? undefined : date;
};

export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Verificar se é uma Data válida e criar string no formato YYYY-MM-DD
  if (date instanceof Date && !isNaN(date.getTime())) {
    // Garantir timezone local na formatação
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`formatDateForInput: Convertendo data ${date.toISOString()} para formato input: ${formattedDate}`);
    return formattedDate;
  }
  
  return '';
};

// Função melhorada para criar datas seguras (sem mutações acidentais)
export const createSafeDate = (year: number, month: number, day: number = 1): Date => {
  // month é 0-indexed no JavaScript (janeiro = 0)
  // Os valores de mês nos nossos selects já são 0-indexed (0-11)
  console.log(`Criando data segura: Ano=${year}, Mês=${month}, Dia=${day}`);
  return new Date(year, month, day);
};

/**
 * Normaliza uma data para início do dia (00:00:00) na timezone local
 * Importante para comparações de datas sem considerar a hora
 */
export const normalizeToStartOfDay = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  console.log(`Normalizando para início do dia: ${date.toISOString()} -> ${normalizedDate.toISOString()}`);
  return normalizedDate;
};

/**
 * Normaliza uma data para fim do dia (23:59:59.999) na timezone local
 * Importante para comparações de datas sem considerar a hora
 */
export const normalizeToEndOfDay = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  console.log(`Normalizando para fim do dia: ${date.toISOString()} -> ${normalizedDate.toISOString()}`);
  return normalizedDate;
};

/**
 * Converte uma data para formato ISO sem timezone (YYYY-MM-DD)
 * Útil para queries Supabase que precisam de data sem hora
 */
export const toISODateString = (date: Date): string => {
  const isoString = date.toISOString().split('T')[0];
  console.log(`Convertendo para ISO Date String: ${date.toISOString()} -> ${isoString}`);
  return isoString;
};
