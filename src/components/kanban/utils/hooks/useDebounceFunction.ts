
import { useCallback, useRef } from 'react';

/**
 * Hook para criar função com debounce
 * 
 * @param fn Função a ser executada com debounce
 * @param delay Tempo de espera em ms
 * @returns Função com debounce aplicado
 * 
 * @deprecated Use useDebounce para valores em vez de funções
 */
export function useDebounceFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  console.log('⚠️ [useDebounceFunction] DEPRECATED: Use useDebounce para valores');
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        fn(...args);
        timerRef.current = null;
      }, delay);
    },
    [fn, delay]
  );
}
