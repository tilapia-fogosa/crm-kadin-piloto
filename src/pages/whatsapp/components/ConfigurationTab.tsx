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

export function ConfigurationTab() {
  console.log('ConfigurationTab: Renderizando aba de configuração');
  
  const [isActive, setIsActive] = useState(true);
  const { data: whatsappStatus, isLoading } = useWhatsAppStatus();
  
  const handleToggle = (checked: boolean) => {
    console.log('ConfigurationTab: Alterando status para:', checked ? 'Ativo' : 'Inativo');
    setIsActive(checked);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do WhatsApp</CardTitle>
          <CardDescription>
            Gerencie as configurações da integração com WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status de conexão */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status">Status da Integração</Label>
              <p className="text-sm text-muted-foreground">
                Ative ou desative a integração com WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                id="status"
                checked={isActive}
                onCheckedChange={handleToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Status da Conexão (Somente leitura) */}
          <div className="space-y-2">
            <Label>Status da Conexão</Label>
            <div className="flex items-center gap-3">
              <Input
                value={isLoading ? "Carregando..." : whatsappStatus?.label || "Desconectado"}
                readOnly
                className="max-w-xs bg-muted cursor-not-allowed"
              />
              <Badge 
                variant={
                  whatsappStatus?.color === 'success' ? 'default' : 
                  whatsappStatus?.color === 'warning' ? 'secondary' : 
                  'destructive'
                }
              >
                {isLoading ? "..." : whatsappStatus?.label || "Desconectado"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Status em tempo real da conexão com WhatsApp (atualiza a cada 10 segundos)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Mensagens Automáticas */}
      <AutoMessageForm />
    </div>
  );
}
