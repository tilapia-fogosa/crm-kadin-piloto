
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
    const result = !isProcessing && timeSinceLastSubmission > debounceMs;
    
    console.log('Verificando se pode submeter:', {
      isProcessing,
      timeSinceLastSubmission,
      debounceMs,
      canSubmit: result
    });
    
    return result;
  }, [isProcessing, debounceMs]);

  const wrapSubmission = useCallback(async <T>(submissionFn: () => Promise<T>) => {
    console.log('Iniciando wrapSubmission');
    
    if (!canSubmit()) {
      console.log('Submissão bloqueada - muito cedo ou já processando');
      return null;
    }

    try {
      console.log('Definindo estado para processando...');
      setIsProcessing(true);
      lastSubmissionTime.current = Date.now();
      
      console.log('Executando função de submissão');
      const result = await submissionFn();
      
      console.log('Submissão concluída com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro durante submissão:', error);
      throw error;
    } finally {
      console.log('Finalizando processamento');
      setIsProcessing(false);
    }
  }, [canSubmit]);

  return {
    isProcessing,
    wrapSubmission
  };
}
