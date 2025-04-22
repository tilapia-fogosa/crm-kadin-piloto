
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

/**
 * Normaliza uma data para comparar apenas dia, mês e ano (sem hora)
 * Esta função retorna uma nova data com o mesmo dia/mês/ano mas com hora zerada (00:00:00)
 * @param date Data para normalizar
 * @returns Data normalizada (somente data, sem horário)
 */
export const normalizeDate = (date: Date | string | null | undefined): Date | null => {
  // Validação de entrada
  if (!date) {
    console.log('[DATE UTILS] Data inválida ou nula para normalização');
    return null;
  }

  try {
    // Converter para objeto Date se for string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar se é uma data válida
    if (isNaN(dateObj.getTime())) {
      console.error('[DATE UTILS] Data inválida para normalização:', date);
      return null;
    }
    
    // Criar nova data apenas com ano, mês e dia (hora zerada)
    const normalized = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      0, 0, 0, 0
    );
    
    return normalized;
  } catch (error) {
    console.error('[DATE UTILS] Erro ao normalizar data:', error);
    return null;
  }
};

/**
 * Compara se duas datas representam o mesmo dia, independente do horário
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns true se as datas representam o mesmo dia
 */
export const isSameLocalDay = (date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean => {
  // Normalizar as duas datas
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  // Se alguma data for inválida, retorna false
  if (!normalizedDate1 || !normalizedDate2) {
    return false;
  }
  
  // Comparar as datas normalizadas
  return normalizedDate1.getTime() === normalizedDate2.getTime();
};
