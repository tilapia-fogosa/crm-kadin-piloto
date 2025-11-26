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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWhatsAppStatus } from "../hooks/useWhatsAppStatus";
import { AutoMessageModal } from "./AutoMessageModal";
import { AutoMessagesList } from "./AutoMessagesList";
import { MensagemAutomaticaModal } from "./MensagemAutomaticaModal";
import { MensagensAutomaticasList } from "./MensagensAutomaticasList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUnit } from "@/contexts/UnitContext";

export function ConfigurationTab() {
  console.log('ConfigurationTab: Renderizando aba de configuração');
  const [isActive, setIsActive] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<{ id: string; nome: string; mensagem: string } | null>(null);
  
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [autoEditData, setAutoEditData] = useState<{ id: string; tipo: string; mensagem: string } | null>(null);
  
  const { selectedUnitId } = useUnit();
  
  const {
    data: whatsappStatus,
    isLoading
  } = useWhatsAppStatus();
  
  const handleToggle = (checked: boolean) => {
    console.log('ConfigurationTab: Alterando status para:', checked ? 'Ativo' : 'Inativo');
    setIsActive(checked);
  };

  const handleCreateNew = () => {
    console.log('ConfigurationTab: Abrindo modal para criar nova mensagem');
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (id: string, nome: string, mensagem: string) => {
    console.log('ConfigurationTab: Abrindo modal para editar mensagem');
    setEditData({ id, nome, mensagem });
    setModalOpen(true);
  };

  const handleEditAuto = (id: string, tipo: string, mensagem: string) => {
    console.log('ConfigurationTab: Abrindo modal para editar mensagem automática');
    setAutoEditData({ id, tipo, mensagem });
    setAutoModalOpen(true);
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

      {/* Seção de Mensagens Padronizadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mensagens Padronizadas</CardTitle>
              <CardDescription>
                Gerencie suas mensagens padronizadas do WhatsApp
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AutoMessagesList onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Seção de Mensagens Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Automáticas</CardTitle>
          <CardDescription>
            Configure as mensagens automáticas de boas-vindas e valorização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MensagensAutomaticasList selectedUnitId={selectedUnitId} onEdit={handleEditAuto} />
        </CardContent>
      </Card>
      </div>

      {/* Modal de criação/edição de mensagens padronizadas */}
      <AutoMessageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editData={editData}
      />

      {/* Modal de edição de mensagens automáticas */}
      <MensagemAutomaticaModal
        open={autoModalOpen}
        onOpenChange={setAutoModalOpen}
        editData={autoEditData}
      />
    </ScrollArea>;
}