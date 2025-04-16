
export const parseFormDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  // Criar uma nova instância de Data
  const date = new Date(dateString);
  console.log(`parseFormDate: Convertendo "${dateString}" para Data: ${date.toISOString()}`);
  return isNaN(date.getTime()) ? undefined : date;
};

export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Verificar se é uma Data válida e criar string no formato YYYY-MM-DD
  if (date instanceof Date && !isNaN(date.getTime())) {
    // Garantir timezone local na formatação
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`formatDateForInput: Convertendo data ${date.toISOString()} para formato input: ${formattedDate}`);
    return formattedDate;
  }
  
  return '';
};

// Nova função para criar datas seguras (sem mutações acidentais)
export const createSafeDate = (year: number, month: number, day: number = 1): Date => {
  // month é 0-indexed no JavaScript (janeiro = 0)
  console.log(`Criando data segura: Ano=${year}, Mês=${month}, Dia=${day}`);
  return new Date(year, month, day);
};
