
import { format } from "date-fns";

/**
 * Cria uma data segura a partir de ano e mês
 * @param year Ano
 * @param month Mês (1-12)
 * @returns Date object
 */
export const createSafeDate = (year: number, month: number): Date => {
  // Validar entrada
  if (isNaN(year) || isNaN(month)) {
    console.error(`[DATE UTILS] Valores inválidos para data: ano=${year}, mês=${month}`);
    // Valores padrão
    year = new Date().getFullYear();
    month = new Date().getMonth() + 1;
  }
  
  // Validar intervalo do mês (1-12)
  if (month < 1 || month > 12) {
    console.error(`[DATE UTILS] Mês inválido: ${month}. Usando mês 1.`);
    month = 1;
  }
  
  // Mês no Date é 0-based, então subtraímos 1
  const date = new Date(year, month - 1, 1);
  
  console.log(`[DATE UTILS] Data criada: ${format(date, 'dd/MM/yyyy')} para ano=${year}, mês=${month}`);
  return date;
};

/**
 * Formata uma data para string no formato yyyy-MM-dd
 * @param date Data para formatar
 * @returns String formatada
 */
export const getDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
