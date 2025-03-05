
export const parseFormDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
};

export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  return date instanceof Date ? date.toISOString().split('T')[0] : '';
};
