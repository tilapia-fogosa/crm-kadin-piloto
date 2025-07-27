import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Processar base64 em chunks para evitar problemas de memória
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  console.log('transcribe-audio - Função chamada:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, format = 'webm' } = await req.json();
    console.log('transcribe-audio - Dados recebidos:', { hasAudio: !!audio, format });
    
    if (!audio) {
      throw new Error('Dados de áudio não fornecidos');
    }

    // Obter chave da OpenAI dos secrets
    const openaiKey = Deno.env.get('OpenAI Whisper');
    if (!openaiKey) {
      throw new Error('Chave OpenAI não configurada');
    }

    console.log('transcribe-audio - Processando áudio em chunks');
    const binaryAudio = processBase64Chunks(audio);
    console.log('transcribe-audio - Áudio processado, tamanho:', binaryAudio.length, 'bytes');
    
    // Preparar FormData para OpenAI
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { 
      type: format === 'webm' ? 'audio/webm' : `audio/${format}` 
    });
    formData.append('file', blob, `audio.${format}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt'); // Português brasileiro

    console.log('transcribe-audio - Enviando para OpenAI Whisper');
    
    // Enviar para OpenAI Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('transcribe-audio - Erro OpenAI:', response.status, errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('transcribe-audio - Transcrição realizada com sucesso:', result.text?.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        text: result.text,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('transcribe-audio - Erro:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});