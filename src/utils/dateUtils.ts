
import { format, startOfDay, endOfDay, parseISO } from "date-fns";

/**
 * Utilitários para manipulação de datas
 * Inclui funções para parsing, formatação e normalização de datas
 */

/**
 * Cria uma data segura para o ano e mês especificados
 * @param year Ano (formato de 4 dígitos)
 * @param month Mês (0-11, sendo 0 = Janeiro)
 * @param day Dia do mês (1-31)
 * @returns Nova instância de Date
 */
export const createSafeDate = (year: number, month: number, day: number = 1): Date => {
  // Log para rastreamento
  console.log(`[DATE UTILS] Criando data: Ano=${year}, Mês=${month}, Dia=${day}`);
  
  // Garantir que estamos criando uma nova instância
  const date = new Date(year, month, day);
  
  // Validar se a data é válida
  if (isNaN(date.getTime())) {
    console.error(`[DATE UTILS] Data inválida criada: ${date}`);
    return new Date(); // Retornar data atual como fallback
  }
  
  console.log(`[DATE UTILS] Data criada: ${date.toISOString()} (${format(date, 'dd/MM/yyyy')})`);
  return date;
};

/**
 * Formata uma data para exibição em campos de entrada
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Verificar se é uma Data válida
  if (date instanceof Date && !isNaN(date.getTime())) {
    // Garantir timezone local na formatação
    return format(date, 'yyyy-MM-dd');
  }
  
  return '';
};

/**
 * Converte uma string de data de um formulário para um objeto Date
 * @param dateString String de data (formato YYYY-MM-DD)
 * @returns Objeto Date ou undefined se inválido
 */
export const parseFormDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  
  try {
    // Usar parseISO do date-fns para parsing consistente
    const date = parseISO(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.error(`[DATE UTILS] Data inválida: "${dateString}"`);
      return undefined;
    }
    
    console.log(`[DATE UTILS] Data parseada: "${dateString}" => ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error(`[DATE UTILS] Erro ao parsear data "${dateString}":`, error);
    return undefined;
  }
};

/**
 * Compara duas datas sem considerar a hora
 * @param date1 Primeira data para comparação
 * @param date2 Segunda data para comparação
 * @returns true se as datas são iguais desconsiderando horário
 */
export const isSameLocalDate = (date1: Date, date2: Date): boolean => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de comparar objeto não-Data');
    return false;
  }
  
  // Usar startOfDay para comparação consistente
  const day1 = startOfDay(date1);
  const day2 = startOfDay(date2);
  
  const result = day1.getTime() === day2.getTime();
  
  console.log(`[DATE UTILS] Comparando ${format(date1, 'dd/MM/yyyy')} e ${format(date2, 'dd/MM/yyyy')} => ${result ? 'Iguais' : 'Diferentes'}`);
  return result;
};

/**
 * Normaliza uma data para início do dia (00:00:00)
 * @param date Data a ser normalizada
 * @returns Nova instância de Data com horário zerado
 */
export const normalizeToStartOfDay = (date: Date): Date => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de normalizar objeto não-Data');
    return new Date();
  }
  
  const normalizedDate = startOfDay(date);
  
  console.log(`[DATE UTILS] Normalizado início: ${format(date, 'dd/MM/yyyy HH:mm:ss')} -> ${format(normalizedDate, 'dd/MM/yyyy HH:mm:ss')}`);
  return normalizedDate;
};

/**
 * Normaliza uma data para fim do dia (23:59:59.999)
 * @param date Data a ser normalizada
 * @returns Nova instância de Data com horário no fim do dia
 */
export const normalizeToEndOfDay = (date: Date): Date => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de normalizar objeto não-Data');
    return new Date();
  }
  
  const normalizedDate = endOfDay(date);
  
  console.log(`[DATE UTILS] Normalizado fim: ${format(date, 'dd/MM/yyyy HH:mm:ss')} -> ${format(normalizedDate, 'dd/MM/yyyy HH:mm:ss')}`);
  return normalizedDate;
};

/**
 * Converte uma data para formato ISO (YYYY-MM-DD)
 * @param date Data a ser convertida
 * @returns String no formato YYYY-MM-DD
 */
export const toISODateString = (date: Date): string => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de formatar objeto não-Data');
    return '';
  }
  
  try {
    const isoString = format(date, 'yyyy-MM-dd');
    console.log(`[DATE UTILS] ISO Date String: ${format(date, 'dd/MM/yyyy')} -> ${isoString}`);
    return isoString;
  } catch (error) {
    console.error('[DATE UTILS] Erro ao formatar data para ISO:', error);
    return '';
  }
};
