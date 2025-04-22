import { startOfDay, endOfDay, format } from "date-fns";

/**
 * Retorna um intervalo de datas ISO para consulta SQL
 * @param date Data de referência 
 * @returns Objeto com strings ISO para início e fim do dia
 */
export const getDateRangeForSQL = (date: Date): { start: string, end: string } => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de usar objeto não-Data');
    date = new Date();
  }
  
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);
  
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  
  console.log(`[DATE UTILS] Range SQL para ${format(date, 'dd/MM/yyyy')}:
    Início: ${start}
    Fim: ${end}`);
  
  return { start, end };
};
