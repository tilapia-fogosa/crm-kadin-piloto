/**
 * Balão de mensagem individual
 * 
 * Log: Componente que renderiza uma mensagem no chat
 * Etapas de renderização:
 * 1. Determina alinhamento baseado em fromMe (direita/esquerda)
 * 2. Aplica cores diferentes para mensagens enviadas vs recebidas
 * 3. Formata horário da mensagem
 * 4. Renderiza mídia (imagem, áudio, vídeo) quando disponível
 * 5. Exibe conteúdo com quebras de linha preservadas
 * 
 * Utiliza cores do sistema:
 * - Mensagem enviada (fromMe=true): primary/primary-foreground
 * - Mensagem recebida (fromMe=false): card/card-foreground
 */

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Message } from "../types/whatsapp.types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Play, Volume2, X } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

/**
 * Normaliza tipo de mensagem para aceitar valores em inglês e português
 * Log: Converte 'image' → 'imagem' para compatibilidade com dados existentes
 */
const normalizeMediaType = (type: string | null | undefined): string | null => {
  if (!type) return null;
  
  const typeMap: Record<string, string> = {
    'image': 'imagem',
    'imagem': 'imagem',
    'audio': 'audio',
    'video': 'video',
  };
  
  return typeMap[type.toLowerCase()] || type;
};

/**
 * Normaliza URL do Supabase Storage para garantir path público
 * Log: Adiciona '/public/' quando ausente em URLs do storage
 */
const normalizeStorageUrl = (url: string): string => {
  // Se a URL já tem /public/, retorna sem alteração
  if (url.includes('/object/public/')) return url;
  
  // Substitui /object/BUCKET por /object/public/BUCKET
  return url.replace('/object/', '/object/public/');
};

/**
 * Componente para renderizar imagem com lightbox
 * - Exibe miniatura clicável (max 250x200px)
 * - Abre em modal para visualização em tamanho real
 * - Mostra skeleton durante carregamento
 * - Fallback para erro de carregamento
 */
function MediaImage({ url, alt }: { url: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  console.log('MediaImage: Renderizando imagem:', url);

  if (hasError) {
    return (
      <div className="flex items-center justify-center w-[200px] h-[150px] bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span className="text-xs">Imagem indisponível</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(true)}>
        {isLoading && (
          <Skeleton className="w-[200px] h-[150px] rounded-lg" />
        )}
        <img
          src={url}
          alt={alt || "Imagem"}
          className={cn(
            "max-w-[250px] max-h-[200px] rounded-lg object-cover",
            isLoading && "hidden"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        {!isLoading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
              Clique para ampliar
            </span>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={url}
            alt={alt || "Imagem"}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Componente para renderizar áudio
 * - Player nativo HTML5
 * - Controles: play/pause, barra de progresso, volume
 * - Estilo visual consistente com o chat
 */
function MediaAudio({ url }: { url: string }) {
  console.log('MediaAudio: Renderizando áudio:', url);

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 min-w-[200px]">
      <Volume2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <audio
        src={url}
        controls
        className="w-full h-8"
        preload="metadata"
      >
        Seu navegador não suporta o elemento de áudio.
      </audio>
    </div>
  );
}

/**
 * Componente para renderizar vídeo
 * - Player nativo HTML5
 * - Tamanho máximo: 300x200px
 * - Controles: play/pause, fullscreen
 */
function MediaVideo({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  console.log('MediaVideo: Renderizando vídeo:', url);

  return (
    <div className="relative">
      {isLoading && (
        <div className="w-[250px] h-[150px] bg-muted rounded-lg flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <video
        src={url}
        controls
        className={cn(
          "max-w-[300px] max-h-[200px] rounded-lg",
          isLoading && "hidden"
        )}
        preload="metadata"
        onLoadedData={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      >
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
}

/**
 * Componente principal do balão de mensagem
 * Renderiza mídia baseado no tipoMensagem e mediaUrl
 */
export function ChatMessage({ message }: ChatMessageProps) {
  // Normaliza tipo e URL para compatibilidade com dados em inglês/português e URLs malformadas
  const normalizedType = normalizeMediaType(message.tipoMensagem);
  const normalizedUrl = message.mediaUrl ? normalizeStorageUrl(message.mediaUrl) : null;

  console.log('ChatMessage: Renderizando mensagem ID:', message.id, 'tipo:', message.tipoMensagem, '→', normalizedType, 'hasMedia:', !!normalizedUrl);

  const time = format(new Date(message.createdAt), 'HH:mm', { locale: ptBR });

  /**
   * Lógica de renderização de mídia:
   * 1. tipoMensagem = 'imagem' + mediaUrl presente → Renderizar <img> com lightbox
   * 2. tipoMensagem = 'audio' + mediaUrl presente → Renderizar <audio> player
   * 3. tipoMensagem = 'video' + mediaUrl presente → Renderizar <video> player
   * 4. tipoMensagem = 'audio' sem mediaUrl → Comportamento atual (áudio transcrito)
   * 5. Outros casos → Renderizar texto normalmente
   */
  const renderMedia = () => {
    if (!normalizedUrl) return null;

    switch (normalizedType) {
      case 'imagem':
        return <MediaImage url={normalizedUrl} />;
      case 'audio':
        return <MediaAudio url={normalizedUrl} />;
      case 'video':
        return <MediaVideo url={normalizedUrl} />;
      default:
        return null;
    }
  };

  const hasMediaToRender = normalizedUrl && ['imagem', 'audio', 'video'].includes(normalizedType || '');
  const isTranscribedAudio = normalizedType === 'audio' && !normalizedUrl;

  return (
    <div
      className={cn(
        "flex mb-2",
        message.fromMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
          message.fromMe
            ? "bg-[#f7dcc9] text-black rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border border-border"
        )}
      >
        {/* Renderiza mídia se disponível */}
        {hasMediaToRender && (
          <div className="mb-2">
            {renderMedia()}
          </div>
        )}

        {/* Renderiza texto/conteúdo */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {isTranscribedAudio && (
              <span className="font-bold">Áudio transcrito: </span>
            )}
            {message.content}
          </p>
        )}

        {/* Rodapé com autor e horário */}
        <div className="flex items-center justify-between mt-1 text-xs opacity-70 gap-2">
          {message.fromMe && message.createdByName && (
            <span>{message.createdByName}</span>
          )}
          <span className={!message.fromMe || !message.createdByName ? "ml-auto" : ""}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
