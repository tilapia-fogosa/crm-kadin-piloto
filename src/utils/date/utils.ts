
import { format } from "date-fns";

/**
 * Cria uma data segura a partir de ano e mês
 * @param year Ano
 * @param month Mês (1-12)
 * @returns Date object
 */
export const createSafeDate = (year: number, month: number): Date => {
  if (isNaN(year) || isNaN(month)) {
    console.error(`[DATE UTILS] Valores inválidos para data: ano=${year}, mês=${month}`);
    year = new Date().getFullYear();
    month = new Date().getMonth() + 1;
  }
  if (month < 1 || month > 12) {
    console.error(`[DATE UTILS] Mês inválido: ${month}. Usando mês 1.`);
    month = 1;
  }
  const date = new Date(year, month - 1, 1);
  console.log(`[DATE UTILS] Data criada: ${format(date, 'dd/MM/yyyy')} para ano=${year}, mês=${month}`);
  return date;
};

/**
 * Retorna uma nova data zerada (só ano, mês, dia)
 * @param date Data para normalizar (aceita Date ou string ISO)
 * @returns Date normalizada ou null se inválida
 */
export const normalizeDate = (date: Date | string | null | undefined): Date | null => {
  if (!date) {
    console.log('[DATE UTILS] Data inválida para normalização:', date);
    return null;
  }
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  if (!dateObj || isNaN(dateObj.getTime())) {
    console.error('[DATE UTILS] Data inválida para normalização:', date);
    return null;
  }
  // Criação da nova data "zerada"
  const normalized = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    0, 0, 0, 0
  );
  // Log detalhado da normalização
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DATE UTILS] Normalização: input=${date}, output=${format(normalized, 'yyyy-MM-dd')}`);
  }
  return normalized;
};

/**
 * Compara se duas datas representam o MESMO dia local, ignorando horário
 */
export const isSameLocalDay = (date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
