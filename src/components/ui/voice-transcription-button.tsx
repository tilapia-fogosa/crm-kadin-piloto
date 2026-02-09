import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Circle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceTranscriptionButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function VoiceTranscriptionButton({ 
  onTranscript, 
  disabled = false,
  variant = "outline",
  size = "sm"
}: VoiceTranscriptionButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  console.log('VoiceTranscriptionButton - Renderizando componente');

  const startRecording = async () => {
    console.log('VoiceTranscriptionButton - Iniciando gravação');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('VoiceTranscriptionButton - Permissão de microfone obtida');
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('VoiceTranscriptionButton - Chunk de áudio recebido:', event.data.size);
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('VoiceTranscriptionButton - Gravação finalizada, processando...');
        await processRecording();
        
        // Parar todas as tracks do stream para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Coleta chunks a cada 1 segundo
      setIsRecording(true);
      
      // Parar automaticamente após 2 minutos
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current?.state === 'recording') {
          console.log('VoiceTranscriptionButton - Parando gravação por timeout (2 min)');
          stopRecording();
        }
      }, 120000);
      
    } catch (error) {
      console.error('VoiceTranscriptionButton - Erro ao acessar microfone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    console.log('VoiceTranscriptionButton - Parando gravação');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    console.log('VoiceTranscriptionButton - Processando gravação');
    setIsProcessing(true);
    
    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error('Nenhum áudio foi gravado');
      }
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('VoiceTranscriptionButton - Blob criado, tamanho:', audioBlob.size, 'bytes');
      
      // Converter para base64
      const base64Audio = await blobToBase64(audioBlob);
      console.log('VoiceTranscriptionButton - Áudio convertido para base64');
      
      // Chamar Edge Function para transcrição
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          audio: base64Audio,
          format: 'webm'
        }
      });
      
      if (error) {
        console.error('VoiceTranscriptionButton - Erro na transcrição:', error);
        throw new Error('Erro ao processar transcrição');
      }
      
      if (!data.success || !data.text) {
        console.error('VoiceTranscriptionButton - Resposta inválida:', data);
        throw new Error('Não foi possível transcrever o áudio');
      }
      
      console.log('VoiceTranscriptionButton - Transcrição realizada:', data.text?.substring(0, 100) + '...');
      
      // Capitalizar primeira letra e garantir ponto final
      let transcribedText = data.text.trim();
      if (transcribedText) {
        transcribedText = transcribedText.charAt(0).toUpperCase() + transcribedText.slice(1);
        if (!transcribedText.endsWith('.') && !transcribedText.endsWith('!') && !transcribedText.endsWith('?')) {
          transcribedText += '.';
        }
      }
      
      onTranscript(transcribedText);
      
    } catch (error) {
      console.error('VoiceTranscriptionButton - Erro no processamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao transcrever áudio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:audio/webm;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleClick = () => {
    console.log('VoiceTranscriptionButton - Botão clicado, estado atual:', { isRecording, isProcessing });
    
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isRecording) {
      return <Circle className="h-4 w-4 fill-current animate-pulse" />;
    }
    
    return <Mic className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (isRecording) {
      return "destructive";
    }
    
    return variant;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={getButtonVariant()}
        size={size}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title={
          isProcessing 
            ? "Processando transcrição..." 
            : isRecording 
              ? "Clique para enviar o áudio" 
              : "Clique para gravar áudio"
        }
      >
        {getButtonContent()}
      </Button>
      {isRecording && (
        <span className="text-sm text-muted-foreground animate-pulse">
          Clique para enviar o áudio
        </span>
      )}
    </div>
  );
}