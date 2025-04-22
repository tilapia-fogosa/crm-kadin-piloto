
import { format } from "date-fns";
import { normalizeDate } from "./utils";

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
  
  // Normalizar ambas as datas para comparar apenas dia/mês/ano
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  // Se alguma data for inválida, retorna false
  if (!normalizedDate1 || !normalizedDate2) {
    return false;
  }
  
  // Comparar timestamps das datas normalizadas
  const result = normalizedDate1.getTime() === normalizedDate2.getTime();
  
  // Log simplificado apenas quando necessário para debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DATE UTILS] Comparação de datas: ${format(date1, 'dd/MM/yyyy')} e ${format(date2, 'dd/MM/yyyy')} => ${result ? 'IGUAIS' : 'DIFERENTES'}`);
  }
  
  return result;
};
