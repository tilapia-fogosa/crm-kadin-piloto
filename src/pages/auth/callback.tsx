
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleAuthCallback } = useGoogleCalendar()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      
      if (code) {
        const success = await handleAuthCallback(code)
        if (success) {
          navigate('/agenda')
        } else {
          navigate('/auth')
        }
      } else {
        navigate('/auth')
      }
      setIsProcessing(false)
    }

    processCallback()
  }, [searchParams, handleAuthCallback, navigate])

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Conectando ao Google Calendar...</p>
      </div>
    )
  }

  return null
}
