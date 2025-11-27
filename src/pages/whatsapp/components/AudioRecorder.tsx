/**
 * Componente de gravação de áudio para WhatsApp
 * 
 * Log: Gerencia gravação e envio de mensagens de áudio
 * Etapas:
 * 1. Solicita permissão de microfone
 * 2. Grava áudio usando MediaRecorder API
 * 3. Converte áudio para base64
 * 4. Envia para webhook do N8N
 * 5. Salva transcrição no banco de dados
 * 
 * Estados:
 * - idle: não está gravando
 * - recording: gravando áudio
 * - processing: processando/enviando áudio
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Play, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AudioRecorderProps {
  conversation: {
    clientId: string;
    phoneNumber: string;
  };
  onStateChange?: (state: RecordingState) => void;
  onSendAudioReady?: (sendFn: () => Promise<void>) => void;
}

type RecordingState = 'idle' | 'recording' | 'preview' | 'processing';

export function AudioRecorder({ conversation, onStateChange, onSendAudioReady }: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  console.log('AudioRecorder: Componente renderizado para cliente:', conversation.clientId);

  /**
   * Inicia gravação de áudio
   * Solicita permissão de microfone e configura MediaRecorder
   */
  const startRecording = async () => {
    console.log('AudioRecorder: Iniciando gravação');
    
    try {
      // Solicita acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Configura MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Coleta chunks de áudio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('AudioRecorder: Chunk de áudio recebido:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando gravação termina, prepara preview
      mediaRecorder.onstop = async () => {
        console.log('AudioRecorder: Gravação finalizada, preparando preview');
        
        // Cria blob do áudio
        const blob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        
        setAudioBlob(blob);
        const newState = 'preview';
        setRecordingState(newState);
        onStateChange?.(newState);
        
        console.log('AudioRecorder: Preview pronto, áudio:', blob.size, 'bytes');
        
        // Passa a função sendAudio para o componente pai
        if (onSendAudioReady) {
          // Necessário criar closure com o blob atual
          const sendFn = async () => {
            await sendAudioInternal(blob);
          };
          onSendAudioReady(sendFn);
        }
        
        toast.success('Áudio gravado!', {
          description: 'Clique em play para ouvir ou enviar'
        });
        
        // Para todos os tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      const newState = 'recording';
      setRecordingState(newState);
      onStateChange?.(newState);
      console.log('AudioRecorder: Gravação iniciada');
      
      toast.info('Gravando áudio...', {
        description: 'Clique no botão novamente para parar'
      });

    } catch (error) {
      console.error('AudioRecorder: Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar microfone', {
        description: 'Verifique as permissões do navegador'
      });
    }
  };

  /**
   * Para gravação de áudio
   */
  const stopRecording = () => {
    console.log('AudioRecorder: Parando gravação');
    
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      const newState = 'processing';
      setRecordingState(newState);
      onStateChange?.(newState);
    }
  };

  /**
   * Reproduz o áudio gravado
   */
  const playAudio = () => {
    if (!audioBlob) return;
    
    console.log('AudioRecorder: Reproduzindo áudio');
    
    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    audioRef.current.play();
    setIsPlaying(true);
  };

  /**
   * Cancela o áudio gravado
   */
  const cancelAudio = () => {
    console.log('AudioRecorder: Cancelando áudio');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setAudioBlob(null);
    setIsPlaying(false);
    const newState = 'idle';
    setRecordingState(newState);
    onStateChange?.(newState);
    audioChunksRef.current = [];
  };

  /**
   * Processa e envia áudio gravado
   * Converte para base64 e envia para webhook
   */
  const sendAudioInternal = async (blobToSend: Blob) => {
    console.log('AudioRecorder: Enviando áudio');
    
    if (!blobToSend) {
      console.log('AudioRecorder: Nenhum áudio para enviar');
      toast.error('Nenhum áudio foi gravado');
      return;
    }

    const newState = 'processing';
    setRecordingState(newState);
    onStateChange?.(newState);

    let success = false;

    try {
      console.log('AudioRecorder: Áudio blob:', blobToSend.size, 'bytes');

      // Converte para base64
      const base64Audio = await blobToBase64(blobToSend);
      console.log('AudioRecorder: Áudio convertido para base64');

      // Busca dados do usuário
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const userName = profile?.full_name || 'Usuário';

      console.log('AudioRecorder: Enviando áudio para webhook');

      // Envia para webhook N8N
      const response = await fetch('https://webhookn8n.agenciakadin.com.br/webhook/envia_audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          phone_number: conversation.phoneNumber,
          client_id: conversation.clientId,
          user_name: userName,
          profile_id: user?.id,
          mime_type: blobToSend.type
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('AudioRecorder: Áudio enviado com sucesso:', result);

      toast.success('Áudio enviado com sucesso!');
      success = true;

      // Invalida cache para atualizar mensagens
      setTimeout(() => {
        console.log('AudioRecorder: Invalidando cache de mensagens');
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', conversation.clientId] });
        queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      }, 1000);

    } catch (error) {
      console.error('AudioRecorder: Erro ao enviar áudio:', error);
      toast.error('Erro ao enviar áudio', {
        description: 'Tente novamente'
      });
      const newState = 'preview';
      setRecordingState(newState);
      onStateChange?.(newState);
    } finally {
      // Limpa apenas se o envio foi bem-sucedido
      if (success) {
        console.log('AudioRecorder: Limpando estado após envio bem-sucedido');
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setAudioBlob(null);
        setIsPlaying(false);
        const newState = 'idle';
        setRecordingState(newState);
        onStateChange?.(newState);
        audioChunksRef.current = [];
      }
    }
  };

  /**
   * Converte Blob para base64
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove o prefixo "data:audio/webm;base64," ou similar
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Alterna estado de gravação
   */
  const handleToggleRecording = () => {
    console.log('AudioRecorder: Toggle gravação, estado atual:', recordingState);
    
    if (recordingState === 'idle') {
      startRecording();
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  };

  // Modo preview: mostra controles de play e cancelar (sem enviar)
  if (recordingState === 'preview') {
    return (
      <div className="flex items-center gap-2">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          size="icon"
          onClick={playAudio}
          disabled={isPlaying}
          title="Ouvir áudio"
        >
          <Play className="h-5 w-5" />
        </Button>
        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
          size="icon"
          onClick={cancelAudio}
          title="Cancelar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Modo normal: botão de gravar
  return (
    <Button
      variant={recordingState === 'recording' ? 'destructive' : 'ghost'}
      size="icon"
      onClick={handleToggleRecording}
      disabled={recordingState === 'processing'}
      className={recordingState === 'recording' ? 'animate-pulse' : ''}
      title={
        recordingState === 'idle' 
          ? 'Gravar áudio' 
          : recordingState === 'recording' 
          ? 'Parar gravação' 
          : 'Processando...'
      }
    >
      {recordingState === 'processing' ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : recordingState === 'recording' ? (
        <Square className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
