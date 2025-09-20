import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, CheckCircle, Loader2 } from "lucide-react";

interface WhatsAppSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SyncStatus = 'disconnected' | 'connecting' | 'connected';

// Log: Modal de sincronização do WhatsApp
export function WhatsAppSyncModal({ open, onOpenChange }: WhatsAppSyncModalProps) {
  console.log('WhatsAppSyncModal: Renderizando modal de sincronização');
  
  const [phone, setPhone] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');

  // Simula processo de conexão
  const handleConnect = () => {
    console.log('WhatsAppSyncModal: Iniciando processo de conexão', { phone });
    setSyncStatus('connecting');
    
    // Simula tempo de conexão
    setTimeout(() => {
      setSyncStatus('connected');
      console.log('WhatsAppSyncModal: Conexão estabelecida');
    }, 3000);
  };

  // Máscara para telefone brasileiro
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '+55 ($1) $2-$3');
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    console.log('WhatsAppSyncModal: Telefone alterado', { formatted });
  };

  const renderContent = () => {
    switch (syncStatus) {
      case 'disconnected':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                placeholder="+55 (11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={19}
              />
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 bg-muted rounded-lg mx-auto flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                QR Code será gerado após inserir o telefone
              </p>
            </div>

            <Button 
              onClick={handleConnect} 
              className="w-full"
              disabled={phone.length < 19}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Gerar QR Code
            </Button>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center space-y-6">
            <div className="w-48 h-48 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
              <div className="w-32 h-32 bg-background rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-primary rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Aguardando leitura do QR Code...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Abra o WhatsApp no seu celular e escaneie o código
              </p>
            </div>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center space-y-6">
            <div className="w-48 h-48 bg-green-50 dark:bg-green-950 rounded-lg mx-auto flex items-center justify-center">
              <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-green-600 dark:text-green-400">
                WhatsApp Conectado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Telefone: {phone}
              </p>
              <p className="text-sm text-muted-foreground">
                Suas automações agora podem enviar mensagens
              </p>
            </div>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Concluir
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Sincronizar WhatsApp
          </DialogTitle>
          <DialogDescription>
            {syncStatus === 'disconnected' && "Configure sua conexão com o WhatsApp"}
            {syncStatus === 'connecting' && "Conectando ao WhatsApp..."}
            {syncStatus === 'connected' && "Conexão estabelecida com sucesso"}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}