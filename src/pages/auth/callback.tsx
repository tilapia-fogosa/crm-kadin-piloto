
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("Processando autenticação...")

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('Erro na autenticação:', error)
        setMessage("Erro na autenticação")
        // Enviar mensagem de erro para janela principal
        if (window.opener) {
          window.opener.postMessage({
            type: 'google-auth-error',
            error
          }, window.location.origin)
        }
        // Fechar popup após um breve delay
        setTimeout(() => window.close(), 1000)
        return
      }
      
      if (code) {
        console.log('Código recebido:', code)
        // Enviar código para janela principal
        if (window.opener) {
          window.opener.postMessage({
            type: 'google-auth-success',
            code
          }, window.location.origin)
        }
        setMessage("Autenticação realizada com sucesso!")
        // Fechar popup após um breve delay
        setTimeout(() => window.close(), 1000)
      } else {
        console.error('Código não encontrado')
        setMessage("Código de autenticação não encontrado")
        // Enviar mensagem de erro para janela principal
        if (window.opener) {
          window.opener.postMessage({
            type: 'google-auth-error',
            error: 'Código não encontrado'
          }, window.location.origin)
        }
        // Fechar popup após um breve delay
        setTimeout(() => window.close(), 1000)
      }
    }

    processCallback()
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  )
}
