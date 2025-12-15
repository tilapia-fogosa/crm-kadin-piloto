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
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";

interface SyncEvolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

export function SyncEvolutionModal({ open, onOpenChange }: SyncEvolutionModalProps) {
  console.log('[SyncEvolutionModal] Renderizando modal, open:', open);
  
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [responseData, setResponseData] = useState<Record<string, unknown> | null>(null);
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
    setResponseData(null);

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
        setResponseData(data.data);
        toast({
          title: "Sincronização iniciada",
          description: "A instância Evolution foi criada/atualizada com sucesso",
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
      setResponseData(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Sincronizar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Digite o número do WhatsApp para criar uma nova instância Evolution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input de Telefone */}
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

          {/* Feedback de Status */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">Sincronização realizada!</p>
                {responseData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {JSON.stringify(responseData)}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">
                Erro ao sincronizar. Tente novamente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={status === 'loading'}
          >
            {status === 'success' ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {status !== 'success' && (
            <Button
              onClick={handleSync}
              disabled={status === 'loading' || phone.replace(/\D/g, '').length < 12}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                'Sincronizar'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
