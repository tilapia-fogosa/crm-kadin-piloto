-- Adicionar campo media_url na tabela historico_comercial
-- Este campo armazena a URL pública do arquivo de mídia (imagem, áudio, vídeo)
ALTER TABLE historico_comercial
ADD COLUMN IF NOT EXISTS media_url TEXT NULL;

-- Comentário explicativo no campo
COMMENT ON COLUMN historico_comercial.media_url IS 'URL pública do arquivo de mídia (imagem, áudio, vídeo) enviado/recebido na conversa';

-- Criar bucket para armazenar mídias do WhatsApp comercial
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wpp_comercial', 
  'wpp_comercial', 
  true,
  10485760, -- 10MB limite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir leitura pública das mídias
CREATE POLICY "Mídias do WhatsApp comercial são públicas para leitura"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wpp_comercial');

-- Política para permitir upload autenticado
CREATE POLICY "Usuários autenticados podem fazer upload de mídias comerciais"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'wpp_comercial' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir deleção por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar mídias comerciais"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'wpp_comercial' 
  AND auth.role() = 'authenticated'
);