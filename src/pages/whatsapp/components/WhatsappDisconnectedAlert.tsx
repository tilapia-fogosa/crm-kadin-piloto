/**
 * Componente de alerta de WhatsApp desconectado
 * 
 * Log: Alerta visual que sobrepõe o chat quando WhatsApp está desconectado
 * Etapas:
 * 1. Recebe o status de desconectado via props
 * 2. Renderiza overlay vermelho sobre o conteúdo
 * 3. Exibe mensagem de erro com instruções
 * 4. Usa AnimatePresence para transição suave
 */

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WhatsappDisconnectedAlertProps {
  isDisconnected: boolean;
}

export function WhatsappDisconnectedAlert({ isDisconnected }: WhatsappDisconnectedAlertProps) {
  console.log('WhatsappDisconnectedAlert: Renderizando alerta, desconectado:', isDisconnected);

  if (!isDisconnected) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      <Alert className="bg-destructive/95 text-destructive-foreground border-destructive shadow-lg">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription className="ml-2 font-medium">
          WhatsApp desconectado, verifique com o franqueado ou com o Suporte da Kadin para refazer a conexão
        </AlertDescription>
      </Alert>
    </div>
  );
}
