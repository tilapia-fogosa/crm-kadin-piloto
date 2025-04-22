
import { format } from "date-fns";

/**
 * Cria uma data segura a partir de ano e mês
 * @param year Ano
 * @param month Mês (1-12)
 * @returns Date object
 */
export const createSafeDate = (year: number, month: number): Date => {
  console.log(`[DATE UTILS] Criando data segura para ${year}-${month}`);
  return new Date(year, month - 1);
};

/**
 * Formata uma data para string no formato yyyy-MM-dd
 * @param date Data para formatar
 * @returns String formatada
 */
export const getDateString = (date: Date): string => {
  console.log(`[DATE UTILS] Formatando data ${date.toISOString()}`);
  return format(date, 'yyyy-MM-dd');
};

