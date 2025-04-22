
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
  
  // Normalizar as datas para início do dia em UTC
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  
  const result = (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
  
  console.log(`[DATE UTILS] Comparação detalhada de datas:
    Data 1: ${d1.toISOString()} (${format(d1, 'dd/MM/yyyy')})
    Data 2: ${d2.toISOString()} (${format(d2, 'dd/MM/yyyy')})
    Ano igual: ${d1.getUTCFullYear() === d2.getUTCFullYear()}
    Mês igual: ${d1.getUTCMonth() === d2.getUTCMonth()}
    Dia igual: ${d1.getUTCDate() === d2.getUTCDate()}
    Resultado final: ${result ? 'MESMA DATA' : 'DATAS DIFERENTES'}`
  );
  
  return result;
};
