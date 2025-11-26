/**
 * Aba de configuração
 * 
 * Log: Componente da aba de configuração do WhatsApp
 * Etapas:
 * 1. Gerencia estado de ativação (useState local por enquanto)
 * 2. Exibe card com título e descrição
 * 3. Mostra switch para ativar/desativar
 * 4. Exibe badge visual do status atual
 * 5. Exibe status de conexão (somente leitura) da coluna 16
 * 6. Exibe seção para criar mensagens automáticas
 * 
 * Nota: Estado local por enquanto, no futuro será persistido no banco
 * 
 * Utiliza cores do sistema: card, muted-foreground, primary
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useWhatsAppStatus } from "../hooks/useWhatsAppStatus";
import { AutoMessageForm } from "./AutoMessageForm";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConfigurationTab() {
  console.log('ConfigurationTab: Renderizando aba de configuração');
  const [isActive, setIsActive] = useState(true);
  const {
    data: whatsappStatus,
    isLoading
  } = useWhatsAppStatus();
  const handleToggle = (checked: boolean) => {
    console.log('ConfigurationTab: Alterando status para:', checked ? 'Ativo' : 'Inativo');
    setIsActive(checked);
  };
  return <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-4">
        <Card>
        <CardHeader>
          <CardTitle>Configurações do WhatsApp</CardTitle>
          <CardDescription>
            Gerencie as configurações da integração com WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status de conexão */}
          

          <Separator />

          {/* Status da Conexão (Somente leitura) */}
          <div className="space-y-2">
            <Label>Status da Conexão</Label>
            <div className="flex items-center gap-3">
              <Input value={isLoading ? "Carregando..." : whatsappStatus?.label || "Desconectado"} readOnly className="max-w-xs bg-muted cursor-not-allowed" />
              <Badge variant={whatsappStatus?.color === 'success' ? 'default' : whatsappStatus?.color === 'warning' ? 'secondary' : 'destructive'}>
                {isLoading ? "..." : whatsappStatus?.label || "Desconectado"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Status em tempo real da conexão com WhatsApp</p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Mensagens Automáticas */}
      <AutoMessageForm />
      </div>
    </ScrollArea>;
}