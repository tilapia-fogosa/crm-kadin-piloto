import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface WhatsAppSyncButtonProps {
  onClick: () => void;
  isConnected?: boolean;
}

// Log: Botão de sincronização do WhatsApp
export function WhatsAppSyncButton({ onClick, isConnected = false }: WhatsAppSyncButtonProps) {
  console.log('WhatsAppSyncButton: Renderizando botão de sincronização', { isConnected });

  return (
    <Button
      onClick={onClick}
      variant={isConnected ? "secondary" : "default"}
      className="gap-2"
    >
      <Smartphone className="h-4 w-4" />
      {isConnected ? "WhatsApp Conectado" : "Sincronize seu WhatsApp"}
    </Button>
  );
}