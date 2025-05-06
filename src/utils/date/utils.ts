
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

/**
 * Verifica se uma data é domingo
 * @param date Data a ser verificada
 * @returns true se for domingo
 */
export const isSunday = (date: Date): boolean => {
  return date.getDay() === 0; // 0 = domingo na API Date do JS
};

/**
 * Ajusta o horário para estar dentro do horário comercial (08:00-18:00)
 * @param date Data com horário a ser ajustado
 * @returns Nova data com horário ajustado
 */
export const adjustToBusinessHours = (date: Date): Date => {
  console.log(`[DATE UTILS] Ajustando horário de ${format(date, 'dd/MM/yyyy HH:mm')}`);
  
  const adjustedDate = new Date(date);
  const hours = adjustedDate.getHours();
  
  // Se for antes das 8h, ajusta para 8h
  if (hours < 8) {
    console.log('[DATE UTILS] Horário antes do expediente, ajustando para 08:00');
    adjustedDate.setHours(8, 0, 0, 0);
  } 
  // Se for depois das 18h, ajusta para 17h
  else if (hours >= 18) {
    console.log('[DATE UTILS] Horário após o expediente, ajustando para 17:00');
    adjustedDate.setHours(17, 0, 0, 0);
  }
  
  return adjustedDate;
};

/**
 * Avança a data para o próximo dia útil (pulando domingos)
 * @param date Data base
 * @param days Número de dias a avançar
 * @returns Data avançada, pulando domingos
 */
export const advanceBusinessDays = (date: Date, days: number): Date => {
  console.log(`[DATE UTILS] Avançando ${days} dias úteis a partir de ${format(date, 'dd/MM/yyyy')}`);
  
  const result = new Date(date);
  
  for (let i = 0; i < days; i++) {
    // Avança um dia
    result.setDate(result.getDate() + 1);
    
    // Se for domingo, avança mais um dia
    if (isSunday(result)) {
      console.log('[DATE UTILS] Encontrado domingo, pulando para segunda-feira');
      result.setDate(result.getDate() + 1);
    }
  }
  
  return result;
};

/**
 * Calcula a data/hora para o próximo período de atendimento
 * @param currentDate Data/hora atual
 * @returns Data/hora do próximo período de atendimento
 */
export const getNextBusinessPeriod = (currentDate: Date): Date => {
  console.log(`[DATE UTILS] Calculando próximo período a partir de ${format(currentDate, 'dd/MM/yyyy HH:mm')}`);
  
  const result = new Date(currentDate);
  const hours = result.getHours();
  
  // Definindo os períodos:
  // Manhã: 8h às 12h
  // Tarde: 12h às 18h
  
  if (hours < 12) {
    // Estamos no período da manhã, avançar para início da tarde
    console.log('[DATE UTILS] Período atual: manhã. Avançando para tarde');
    result.setHours(13, 0, 0, 0);
  } else {
    // Estamos na tarde ou noite, avançar para manhã do próximo dia útil
    console.log('[DATE UTILS] Período atual: tarde/noite. Avançando para manhã do próximo dia útil');
    result.setDate(result.getDate() + 1);
    result.setHours(8, 0, 0, 0);
    
    // Se o próximo dia for domingo, avança para segunda
    if (isSunday(result)) {
      console.log('[DATE UTILS] Próximo dia é domingo, pulando para segunda-feira');
      result.setDate(result.getDate() + 1);
    }
  }
  
  return result;
};
