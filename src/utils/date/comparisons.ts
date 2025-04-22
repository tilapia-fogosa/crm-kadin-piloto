
import { format, startOfDay } from "date-fns";

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
  
  // Normalizar as datas para início do dia
  const d1 = startOfDay(new Date(date1));
  const d2 = startOfDay(new Date(date2));
  
  const result = (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
  
  console.log(`[DATE UTILS] Comparação detalhada de datas:
    Data 1: ${format(d1, 'dd/MM/yyyy HH:mm:ss')} (${d1.toISOString()})
    Data 2: ${format(d2, 'dd/MM/yyyy HH:mm:ss')} (${d2.toISOString()})
    Resultado: ${result ? 'MESMA DATA' : 'DATAS DIFERENTES'}
  `);
  
  return result;
};
