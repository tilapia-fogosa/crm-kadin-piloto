/**
 * Normalizes a phone number to a standard format
 * Keeps the +55 prefix if present, otherwise assumes local format
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

// For debugging purposes
export const logPhoneFormat = (phone: string) => {
  console.log('Phone number format:', {
    original: phone,
    normalized: normalizePhoneNumber(phone),
    length: normalizePhoneNumber(phone).length
  });
};
