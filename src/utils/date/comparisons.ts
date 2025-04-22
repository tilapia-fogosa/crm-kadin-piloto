
import { format, startOfDay, isSameDay } from "date-fns";

/**
 * Compara duas datas ignorando timezone e hora
 * @param date1 Primeira data para comparação
 * @param date2 Segunda data para comparação
 * @returns true se as datas são iguais (ano, mês, dia)
 */
export const compareDates = (date1: Date, date2: Date): boolean => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de comparar objeto não-Data');
    return false;
  }
  
  // Utilizar a função isSameDay do date-fns que já faz toda a lógica necessária
  const result = isSameDay(date1, date2);
  
  // Log simplificado apenas quando necessário para debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DATE UTILS] Comparação de datas: ${format(date1, 'dd/MM/yyyy')} e ${format(date2, 'dd/MM/yyyy')} => ${result ? 'IGUAIS' : 'DIFERENTES'}`);
  }
  
  return result;
};
