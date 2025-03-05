
import { useState, useCallback, useRef } from 'react';

interface UseDebounceSubmissionOptions {
  debounceMs?: number;
}

export function useDebounceSubmission({ debounceMs = 5000 }: UseDebounceSubmissionOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const lastSubmissionTime = useRef<number>(0);

  const canSubmit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime.current;
    return !isProcessing && timeSinceLastSubmission > debounceMs;
  }, [isProcessing, debounceMs]);

  const wrapSubmission = useCallback(async <T>(submissionFn: () => Promise<T>) => {
    console.log('Verificando se pode submeter...');
    
    if (!canSubmit()) {
      console.log('Submissão bloqueada - muito cedo ou já processando');
      return null;
    }

    try {
      setIsProcessing(true);
      lastSubmissionTime.current = Date.now();
      console.log('Iniciando submissão');
      
      const result = await submissionFn();
      
      console.log('Submissão concluída com sucesso');
      return result;
    } catch (error) {
      console.error('Erro durante submissão:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [canSubmit]);

  return {
    isProcessing,
    wrapSubmission
  };
}
