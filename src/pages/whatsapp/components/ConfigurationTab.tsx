/**
 * Aba de configuração
 * 
 * Log: Componente da aba de configuração do WhatsApp
 * Etapas:
 * 1. Gerencia estado de ativação (useState local por enquanto)
 * 2. Exibe card com título e descrição
 * 3. Mostra switch para ativar/desativar
 * 4. Exibe badge visual do status atual
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

export function ConfigurationTab() {
  console.log('ConfigurationTab: Renderizando aba de configuração');
  
  const [isActive, setIsActive] = useState(true);
  
  const handleToggle = (checked: boolean) => {
    console.log('ConfigurationTab: Alterando status para:', checked ? 'Ativo' : 'Inativo');
    setIsActive(checked);
  };

  return (
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
      </CardContent>
    </Card>
  );
}
