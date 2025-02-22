
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'

export function useGoogleCalendar() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Buscar configurações do calendário do usuário
  const { data: calendarSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['calendar-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .single()

      if (error) throw error
      return data
    },
  })

  // Iniciar processo de conexão com Google Calendar
  const startGoogleAuth = async () => {
    try {
      setIsConnecting(true)

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { path: 'init' }
      })

      if (error) throw error

      // Redirecionar para página de autenticação do Google
      window.location.href = data.url

    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error)
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google Calendar",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Processar callback do OAuth
  const handleAuthCallback = async (code: string) => {
    try {
      setIsConnecting(true)

      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { path: 'callback', code }
      })

      if (error) throw error

      await refetchSettings()

      toast({
        title: "Conectado com sucesso!",
        description: "Seu calendário Google foi conectado",
      })

      return true

    } catch (error) {
      console.error('Erro ao processar callback:', error)
      toast({
        title: "Erro na conexão",
        description: "Não foi possível completar a conexão com o Google Calendar",
        variant: "destructive"
      })
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  return {
    calendarSettings,
    isConnecting,
    startGoogleAuth,
    handleAuthCallback
  }
}
