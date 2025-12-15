/**
 * Modal de Sincronização WhatsApp Evolution
 * 
 * Log: Modal para criar instância Evolution via N8N
 * Etapas:
 * 1. Exibe campo para input de telefone
 * 2. Valida formato do telefone
 * 3. Chama edge function create-evolution-instance
 * 4. Exibe feedback de sucesso ou erro
 * 
 * Utiliza: supabase.functions.invoke, useToast
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Smartphone, XCircle } from "lucide-react";

interface SyncEvolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

export function SyncEvolutionModal({ open, onOpenChange }: SyncEvolutionModalProps) {
  console.log('[SyncEvolutionModal] Renderizando modal, open:', open);
  
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Formata telefone para exibição
   * Formato: +55 (44) 99999-9999
   */
  const formatPhoneDisplay = (value: string): string => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara progressivamente
    if (numbers.length <= 2) {
      return `+${numbers}`;
    } else if (numbers.length <= 4) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    } else if (numbers.length <= 9) {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    } else {
      return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
    }
  };

  /**
   * Handler para mudança no input de telefone
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    console.log('[SyncEvolutionModal] Telefone alterado:', formatted);
    setPhone(formatted);
  };

  /**
   * Handler para sincronização
   * Chama edge function e processa resposta
   */
  const handleSync = async () => {
    console.log('[SyncEvolutionModal] Iniciando sincronização com telefone:', phone);
    
    // Validar telefone
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 12) {
      console.log('[SyncEvolutionModal] Telefone inválido:', cleanPhone);
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido com DDD",
        variant: "destructive",
      });
      return;
    }

    setStatus('loading');
    setQrCodeBase64(null);

    try {
      console.log('[SyncEvolutionModal] Chamando edge function create-evolution-instance');
      
      const { data, error } = await supabase.functions.invoke('create-evolution-instance', {
        body: { phone: cleanPhone }
      });

      console.log('[SyncEvolutionModal] Resposta:', { data, error });

      if (error) {
        console.error('[SyncEvolutionModal] Erro na chamada:', error);
        throw new Error(error.message || 'Erro ao sincronizar WhatsApp');
      }

      if (data?.success) {
        console.log('[SyncEvolutionModal] Sincronização bem sucedida:', data);
        setStatus('success');
        
        // Extrair QR Code base64 da resposta
        // O webhook pode retornar em diferentes estruturas aninhadas
        // Estrutura esperada: data.data = { success, data: { base64, pairingCode, code } }
        const webhookResponse = data.data;
        console.log('[SyncEvolutionModal] Webhook response:', webhookResponse);
        
        // Tentar diferentes caminhos para o base64
        const qrCode = 
          webhookResponse?.data?.base64 ||  // N8N retorna: { success, data: { base64 } }
          webhookResponse?.base64 ||         // Direto: { base64 }
          webhookResponse?.qrcode ||         // Alternativo: { qrcode }
          webhookResponse?.image;            // Alternativo: { image }
        
        console.log('[SyncEvolutionModal] QR Code encontrado:', qrCode ? 'sim' : 'não', typeof qrCode);
        
        if (typeof qrCode === 'string' && qrCode.length > 100) {
          // Se for base64 puro, adiciona o prefixo de data URI
          const base64Image = qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`;
          setQrCodeBase64(base64Image);
          console.log('[SyncEvolutionModal] QR Code base64 definido com sucesso');
        } else {
          console.log('[SyncEvolutionModal] QR Code não encontrado na resposta');
        }
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('[SyncEvolutionModal] Erro:', errorMessage);
      setStatus('error');
      toast({
        title: "Erro na sincronização",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  /**
   * Reset do modal ao fechar
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      console.log('[SyncEvolutionModal] Fechando modal, resetando estado');
      setPhone("");
      setStatus('idle');
      setQrCodeBase64(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {status === 'success' && qrCodeBase64 ? 'Escaneie o QR Code' : 'Sincronizar WhatsApp'}
          </DialogTitle>
          <DialogDescription>
            {status === 'success' && qrCodeBase64 
              ? 'Abra o WhatsApp no celular e escaneie o código abaixo'
              : 'Digite o número do WhatsApp para criar uma nova instância Evolution'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* QR Code Display - Mostrado quando há sucesso */}
          {status === 'success' && qrCodeBase64 && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <img 
                  src={qrCodeBase64} 
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                O QR Code expira em alguns minutos. Se expirar, clique em "Gerar Novo".
              </p>
            </div>
          )}

          {/* Input de Telefone - Mostrado quando não há QR Code */}
          {!(status === 'success' && qrCodeBase64) && (
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+55 (44) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                disabled={status === 'loading'}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Digite o número completo com código do país e DDD
              </p>
            </div>
          )}

          {/* Loading State */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}

          {/* Feedback de Erro */}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">
                Erro ao gerar QR Code. Tente novamente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={status === 'loading'}
          >
            Fechar
          </Button>
          
          {status === 'success' && qrCodeBase64 ? (
            <Button
              onClick={() => {
                setStatus('idle');
                setQrCodeBase64(null);
              }}
            >
              Gerar Novo
            </Button>
          ) : status !== 'loading' && (
            <Button
              onClick={handleSync}
              disabled={phone.replace(/\D/g, '').length < 12}
            >
              Gerar QR Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
