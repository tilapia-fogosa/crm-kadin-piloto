import { useEffect, useRef } from "react"

interface UseNewLeadNotificationProps {
  soundEnabled: boolean
  clientsData: any[]
}

/**
 * Hook para detectar novos leads e tocar notificação sonora
 * 
 * @param soundEnabled - Se o som está habilitado
 * @param clientsData - Array de clientes para monitorar
 */
export function useNewLeadNotification({ soundEnabled, clientsData }: UseNewLeadNotificationProps) {
  const previousCountRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Inicializar o áudio
  useEffect(() => {
    if (soundEnabled) {
      try {
        audioRef.current = new Audio('/sounds/notification.mp3')
        audioRef.current.preload = 'auto'
        
        // Log para debug
        console.log('🔊 [useNewLeadNotification] Áudio inicializado')
      } catch (error) {
        console.error('🔊 [useNewLeadNotification] Erro ao inicializar áudio:', error)
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [soundEnabled])
  
  // Detectar novos leads
  useEffect(() => {
    const currentCount = clientsData?.length || 0
    
    // Se é a primeira vez ou não há clientes, apenas atualiza a referência
    if (previousCountRef.current === 0) {
      previousCountRef.current = currentCount
      console.log('🔊 [useNewLeadNotification] Inicializando contagem:', currentCount)
      return
    }
    
    // Se há mais clientes que antes, é um novo lead
    if (currentCount > previousCountRef.current && soundEnabled) {
      const newLeadsCount = currentCount - previousCountRef.current
      console.log('🔊 [useNewLeadNotification] Novo(s) lead(s) detectado(s):', newLeadsCount)
      
      // Tocar notificação
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0 // Reset para o início
          audioRef.current.play()
            .then(() => {
              console.log('🔊 [useNewLeadNotification] Som reproduzido com sucesso')
            })
            .catch(error => {
              console.error('🔊 [useNewLeadNotification] Erro ao reproduzir som:', error)
            })
        } catch (error) {
          console.error('🔊 [useNewLeadNotification] Erro ao tocar áudio:', error)
        }
      }
    }
    
    // Atualizar referência
    previousCountRef.current = currentCount
  }, [clientsData, soundEnabled])
  
  // Função para tocar manualmente (para testes)
  const playTestSound = () => {
    if (audioRef.current && soundEnabled) {
      try {
        audioRef.current.currentTime = 0
        audioRef.current.play()
          .then(() => {
            console.log('🔊 [useNewLeadNotification] Som de teste reproduzido')
          })
          .catch(error => {
            console.error('🔊 [useNewLeadNotification] Erro ao reproduzir som de teste:', error)
          })
      } catch (error) {
        console.error('🔊 [useNewLeadNotification] Erro ao tocar áudio de teste:', error)
      }
    }
  }
  
  return { playTestSound }
}