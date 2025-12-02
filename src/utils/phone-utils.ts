/**
 * Formata telefone para o padrão de armazenamento: 55xx9xxxxxxxx
 * Remove caracteres especiais e garante o prefixo 55
 * 
 * Exemplos de entrada → saída:
 * "44991090704" → "5544991090704"
 * "+5544991090704" → "5544991090704"
 * "(44) 99109-0704" → "5544991090704"
 * "5544991090704" → "5544991090704"
 * 
 * @param phone - Telefone em qualquer formato
 * @returns Telefone formatado no padrão 55xx9xxxxxxxx
 */
export const formatPhoneForStorage = (phone: string): string => {
  // Etapa 1: Remove tudo que não é dígito
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Etapa 2: Log para debug
  console.log('formatPhoneForStorage:', { original: phone, digitsOnly });
  
  // Etapa 3: Se já começa com 55 e tem 12-13 dígitos, está ok
  if (digitsOnly.startsWith('55') && digitsOnly.length >= 12) {
    console.log('formatPhoneForStorage: Já está no formato correto:', digitsOnly);
    return digitsOnly;
  }
  
  // Etapa 4: Adiciona 55 no início
  const formatted = '55' + digitsOnly;
  console.log('formatPhoneForStorage: Formatado com prefixo 55:', formatted);
  return formatted;
};

/**
 * Normalizes a phone number to a standard format
 * Keeps the +55 prefix if present, otherwise assumes local format
 * @deprecated Use formatPhoneForStorage instead
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it already has +55, return as is
  if (cleaned.startsWith('+55')) {
    return cleaned;
  }
  
  // If it has 55 prefix without +, add the +
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return '+' + cleaned;
  }
  
  // Otherwise return as is (local format)
  return cleaned;
};

/**
 * Log para debug de formato de telefone
 * @param phone - Telefone a ser analisado
 */
export const logPhoneFormat = (phone: string) => {
  console.log('Phone number format:', {
    original: phone,
    normalized: normalizePhoneNumber(phone),
    formatted: formatPhoneForStorage(phone),
    length: formatPhoneForStorage(phone).length
  });
};
