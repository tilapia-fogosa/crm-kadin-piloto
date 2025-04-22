
import { format } from "date-fns";

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
  
  const result = (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
  
  console.log(`[DATE UTILS] Comparação de datas:
    Data 1: ${date1.toISOString()} (${format(date1, 'dd/MM/yyyy')})
    Data 2: ${date2.toISOString()} (${format(date2, 'dd/MM/yyyy')})
    Resultado: ${result ? 'MESMA DATA' : 'DATAS DIFERENTES'}`);
  
  return result;
};
