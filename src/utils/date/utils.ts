
import { format } from "date-fns";

/**
 * Cria uma data segura a partir de ano e mês
 * @param year Ano
 * @param month Mês (1-12)
 * @returns Date object
 */
export const createSafeDate = (year: number, month: number): Date => {
  console.log(`[DATE UTILS] Criando data segura para ${year}-${month}`);
  
  // Validar intervalo do mês (1-12)
  if (month < 1 || month > 12) {
    console.error(`[DATE UTILS] Mês inválido: ${month}. Usando mês 1.`);
    month = 1;
  }
  
  // Mês no Date é 0-based, então subtraímos 1
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

