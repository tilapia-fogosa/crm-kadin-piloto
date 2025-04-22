
import { format } from "date-fns";

/**
 * Retorna as datas iniciais e finais de um mês específico
 * @param year Ano (ex: 2025)
 * @param month Mês (1-12)
 * @returns Objeto com datas de início e fim em formato ISO
 */
export const getMonthDateRange = (year: number, month: number) => {
  console.log(`[V2] Calculando intervalo de datas para ${month}/${year}`);
  
  // Validar intervalo do mês (1-12)
  if (month < 1 || month > 12) {
    console.error(`[V2] Mês inválido: ${month}. Usando mês 1.`);
    month = 1;
  }
  
  // Criar data inicial (primeiro dia do mês)
  const startDate = new Date(Date.UTC(year, month-1, 1, 0, 0, 0));
  
  // Criar data final (último dia do mês)
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  // Log para diagnóstico
  console.log(`[V2] Intervalo calculado: ${startDate.toISOString()} até ${endDate.toISOString()}`);
  
  return {
    startDate,
    endDate,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString()
  };
};

/**
 * Normaliza uma data para o início do dia em UTC
 * Útil para comparações de data ignorando a hora
 * @param date Data para normalizar
 * @returns Data normalizada para início do dia em UTC
 */
export const normalizeToUTCDay = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

/**
 * Verifica se duas datas representam o mesmo dia (ignorando hora)
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns true se as datas representam o mesmo dia
 */
export const isSameUTCDay = (date1: Date, date2: Date): boolean => {
  const d1 = normalizeToUTCDay(date1);
  const d2 = normalizeToUTCDay(date2);
  
  return d1.getTime() === d2.getTime();
};

/**
 * Gera array com todos os dias do mês
 * @param year Ano 
 * @param month Mês (1-12)
 * @returns Array de objetos Date correspondendo a cada dia do mês
 */
export const getDaysInMonth = (year: number, month: number): Date[] => {
  console.log(`[V2] Gerando dias do mês para ${month}/${year}`);
  
  // Validar intervalo do mês (1-12)
  if (month < 1 || month > 12) {
    console.error(`[V2] Mês inválido: ${month}. Usando mês 1.`);
    month = 1;
  }
  
  const days: Date[] = [];
  
  // Calcular último dia do mês
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  
  // Gerar array com todos os dias do mês
  for (let day = 1; day <= lastDay; day++) {
    days.push(new Date(Date.UTC(year, month-1, day)));
  }
  
  console.log(`[V2] Gerados ${days.length} dias para ${month}/${year}`);
  return days;
};

/**
 * Formata uma data para exibição em formato brasileiro
 * @param date Data para formatar
 * @returns String formatada (DD/MM/YYYY)
 */
export const formatDateBR = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};
