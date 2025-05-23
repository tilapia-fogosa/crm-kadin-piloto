
import { useCallback, useRef } from 'react';

/**
 * Hook para criar função com debounce
 * 
 * @param fn Função a ser executada com debounce
 * @param delay Tempo de espera em ms
 * @returns Função com debounce aplicado
 */
export function useDebounceFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Log para demonstrar quando o hook é inicializado
  console.log('useDebounceFunction inicializado com delay:', delay);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        console.log('Executando função após debounce');
        fn(...args);
        timerRef.current = null;
      }, delay);
    },
    [fn, delay]
  );
}
