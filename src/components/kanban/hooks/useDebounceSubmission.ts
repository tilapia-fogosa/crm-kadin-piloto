
import { useState, useCallback, useRef } from 'react';

interface UseDebounceSubmissionOptions {
  debounceMs?: number;
}

export function useDebounceSubmission({ debounceMs = 2000 }: UseDebounceSubmissionOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const lastSubmissionTime = useRef<number>(0);
  const submissionLock = useRef<boolean>(false);

  const canSubmit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime.current;
    const result = !isProcessing && !submissionLock.current && timeSinceLastSubmission > debounceMs;
    
    console.log('Verificando se pode submeter:', {
      isProcessing,
      isLocked: submissionLock.current,
      timeSinceLastSubmission,
      debounceMs,
      canSubmit: result
    });
    
    return result;
  }, [isProcessing, debounceMs]);

  const wrapSubmission = useCallback(async <T>(submissionFn: () => Promise<T>) => {
    console.log('Iniciando wrapSubmission');
    
    if (!canSubmit()) {
      console.log('Submissão bloqueada - muito cedo, processando ou travada');
      return null;
    }

    try {
      console.log('Definindo estado para processando e travando submissão...');
      setIsProcessing(true);
      submissionLock.current = true;
      lastSubmissionTime.current = Date.now();
      
      console.log('Executando função de submissão');
      const result = await submissionFn();
      
      console.log('Submissão concluída com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro durante submissão:', error);
      throw error;
    } finally {
      console.log('Finalizando processamento e liberando trava');
      setIsProcessing(false);
      // Mantém o lock por mais um tempo para garantir
      setTimeout(() => {
        submissionLock.current = false;
      }, debounceMs);
    }
  }, [canSubmit, debounceMs]);

  return {
    isProcessing,
    wrapSubmission
  };
}
