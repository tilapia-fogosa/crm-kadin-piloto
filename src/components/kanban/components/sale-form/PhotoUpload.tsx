
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface PhotoUploadProps {
  onPhotoUploaded: (urls: { photo_url: string; photo_thumbnail_url: string }) => void
}

export function PhotoUpload({ onPhotoUploaded }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const processImage = async (file: File) => {
    // Criar um canvas para redimensionar a imagem
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    return new Promise<Blob>((resolve, reject) => {
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let width = img.width
        let height = img.height
        const maxSize = 400

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Falha ao processar imagem'))
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Falha ao carregar imagem'))
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadPhoto = async (file: File) => {
    try {
      setIsUploading(true)
      console.log('Iniciando upload da foto')

      // Processar imagem principal
      const processedBlob = await processImage(file)
      const mainFileName = `${crypto.randomUUID()}.jpg`
      
      // Upload da imagem principal
      const { data: mainUpload, error: mainError } = await supabase.storage
        .from('sales-photos')
        .upload(mainFileName, processedBlob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (mainError) throw mainError
      console.log('Upload da foto principal concluído:', mainUpload)

      // Gerar URLs públicas
      const { data: { publicUrl: photoUrl } } = supabase.storage
        .from('sales-photos')
        .getPublicUrl(mainFileName)

      // Por enquanto, usando a mesma imagem como thumbnail
      // Em uma implementação futura, podemos gerar um thumbnail real
      const photoThumbnailUrl = photoUrl

      onPhotoUploaded({ photo_url: photoUrl, photo_thumbnail_url: photoThumbnailUrl })
      toast.success('Foto enviada com sucesso!')
      
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar foto. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.')
      return
    }

    // Criar preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Iniciar upload
    await uploadPhoto(file)

    // Limpar preview
    return () => URL.revokeObjectURL(objectUrl)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  })

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Foto do Contrato</h4>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-[400px] rounded-lg shadow-sm"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200 ease-in-out
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Arraste uma foto ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG ou PNG até 5MB
          </p>
        </div>
      )}
    </div>
  )
}
