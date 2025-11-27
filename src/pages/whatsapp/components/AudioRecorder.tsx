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
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AudioRecorderProps {
  conversation: {
    clientId: string;
    phoneNumber: string;
  };
}

type RecordingState = 'idle' | 'recording' | 'processing';

export function AudioRecorder({ conversation }: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

      // Quando gravação termina, processa o áudio
      mediaRecorder.onstop = async () => {
        console.log('AudioRecorder: Gravação finalizada, processando áudio');
        await processAudio();
        
        // Para todos os tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
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
      setRecordingState('processing');
    }
  };

  /**
   * Processa e envia áudio gravado
   * Converte para base64 e envia para webhook
   */
  const processAudio = async () => {
    console.log('AudioRecorder: Processando áudio, chunks:', audioChunksRef.current.length);
    
    if (audioChunksRef.current.length === 0) {
      console.log('AudioRecorder: Nenhum chunk de áudio para processar');
      setRecordingState('idle');
      toast.error('Nenhum áudio foi gravado');
      return;
    }

    try {
      // Cria blob do áudio
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });
      
      console.log('AudioRecorder: Áudio blob criado:', audioBlob.size, 'bytes');

      // Converte para base64
      const base64Audio = await blobToBase64(audioBlob);
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
          mime_type: audioBlob.type
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('AudioRecorder: Áudio enviado com sucesso:', result);

      toast.success('Áudio enviado com sucesso!');

      // Invalida cache para atualizar mensagens
      setTimeout(() => {
        console.log('AudioRecorder: Invalidando cache de mensagens');
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', conversation.clientId] });
        queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      }, 1000);

    } catch (error) {
      console.error('AudioRecorder: Erro ao processar áudio:', error);
      toast.error('Erro ao enviar áudio', {
        description: 'Tente novamente'
      });
    } finally {
      setRecordingState('idle');
      audioChunksRef.current = [];
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
