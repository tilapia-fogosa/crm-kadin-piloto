
import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce em valores
 * Retorna o valor com delay para evitar atualizações muito frequentes
 * 
 * @param value Valor a ser debounced
 * @param delay Tempo de espera em ms (padrão: 500ms)
 * @returns Valor com debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
