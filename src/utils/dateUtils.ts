
import { format, startOfDay, endOfDay, parseISO } from "date-fns";

/**
 * Utilitários para manipulação de datas
 * Inclui funções para parsing, formatação e normalização de datas
 */

/**
 * Cria uma data segura para o ano e mês especificados
 * @param year Ano (formato de 4 dígitos)
 * @param month Mês (0-11, sendo 0 = Janeiro)
 * @param day Dia do mês (1-31)
 * @returns Nova instância de Date
 */
export const createSafeDate = (year: number, month: number, day: number = 1): Date => {
  // Log para rastreamento
  console.log(`[DATE UTILS] Criando data: Ano=${year}, Mês=${month}, Dia=${day}`);
  
  // Garantir que estamos criando uma nova instância
  const date = new Date(year, month, day);
  
  // Validar se a data é válida
  if (isNaN(date.getTime())) {
    console.error(`[DATE UTILS] Data inválida criada: ${date}`);
    return new Date(); // Retornar data atual como fallback
  }
  
  console.log(`[DATE UTILS] Data criada: ${date.toISOString()} (${format(date, 'dd/MM/yyyy')})`);
  return date;
};

/**
 * Formata uma data para exibição em campos de entrada
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Verificar se é uma Data válida
  if (date instanceof Date && !isNaN(date.getTime())) {
    // Garantir timezone local na formatação
    return format(date, 'yyyy-MM-dd');
  }
  
  return '';
};

/**
 * Converte uma string de data de um formulário para um objeto Date
 * @param dateString String de data (formato YYYY-MM-DD)
 * @returns Objeto Date ou undefined se inválido
 */
export const parseFormDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  
  try {
    // Usar parseISO do date-fns para parsing consistente
    const date = parseISO(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.error(`[DATE UTILS] Data inválida: "${dateString}"`);
      return undefined;
    }
    
    console.log(`[DATE UTILS] Data parseada: "${dateString}" => ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error(`[DATE UTILS] Erro ao parsear data "${dateString}":`, error);
    return undefined;
  }
};

/**
 * Compara duas datas sem considerar a hora
 * @param date1 Primeira data para comparação
 * @param date2 Segunda data para comparação
 * @returns true se as datas são iguais desconsiderando horário
 */
export const isSameLocalDate = (date1: Date, date2: Date): boolean => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de comparar objeto não-Data');
    return false;
  }
  
  // Comparação simplificada baseada em dia, mês e ano
  const sameDate = (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
  
  console.log(`[DATE UTILS] Comparando datas:
    Data 1: ${date1.toISOString()} (${format(date1, 'dd/MM/yyyy')})
    Data 2: ${date2.toISOString()} (${format(date2, 'dd/MM/yyyy')})
    Resultado: ${sameDate ? 'IGUAIS' : 'DIFERENTES'}`);
  
  return sameDate;
};

/**
 * Normaliza uma data para início do dia (00:00:00)
 * @param date Data a ser normalizada
 * @returns Nova instância de Data com horário zerado
 */
export const normalizeToStartOfDay = (date: Date): Date => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de normalizar objeto não-Data');
    return new Date();
  }
  
  const normalizedDate = startOfDay(date);
  
  console.log(`[DATE UTILS] Normalizado início: 
    Original: ${date.toISOString()}
    Normalizado: ${normalizedDate.toISOString()}
    Local: ${format(normalizedDate, 'dd/MM/yyyy HH:mm:ss')}
  `);
  
  return normalizedDate;
};

/**
 * Normaliza uma data para fim do dia (23:59:59.999)
 * @param date Data a ser normalizada
 * @returns Nova instância de Data com horário no fim do dia
 */
export const normalizeToEndOfDay = (date: Date): Date => {
  if (!(date instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de normalizar objeto não-Data');
    return new Date();
  }
  
  const normalizedDate = endOfDay(date);
  
  console.log(`[DATE UTILS] Normalizado fim: 
    Original: ${date.toISOString()}
    Normalizado: ${normalizedDate.toISOString()}
    Local: ${format(normalizedDate, 'dd/MM/yyyy HH:mm:ss')}
  `);
  
  return normalizedDate;
};

/**
 * Função simplificada para comparar apenas a parte da data (ano, mês, dia)
 * Substitui o método getUTCDateOnly
 * @param date1 Primeira data para comparação
 * @param date2 Segunda data para comparação
 * @returns true se as datas são iguais (ano, mês, dia)
 */
export const areSameDates = (date1: Date, date2: Date): boolean => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    console.error('[DATE UTILS] Tentativa de comparar objeto não-Data');
    return false;
  }
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const result = (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
  
  console.log(`[DATE UTILS] Comparação de datas simplificada:
    Data 1: ${d1.toISOString()} (${format(d1, 'dd/MM/yyyy')})
    Data 2: ${d2.toISOString()} (${format(d2, 'dd/MM/yyyy')})
    Resultado: ${result ? 'MESMA DATA' : 'DATAS DIFERENTES'}`);
  
  return result;
};

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
  
  // Criar data de início (00:00:00) e fim (23:59:59) do dia
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  
  console.log(`[DATE UTILS] Range SQL para ${format(date, 'dd/MM/yyyy')}:
    Início: ${start}
    Fim: ${end}`);
  
  return { start, end };
};

// Mantemos getUTCDateOnly temporariamente para compatibilidade com código existente
// mas recomendamos usar areSameDates para novas implementações
export const getUTCDateOnly = (date: Date): Date => {
  console.log('[DATE UTILS] AVISO: getUTCDateOnly está obsoleto, use areSameDates');
  return startOfDay(date);
};
