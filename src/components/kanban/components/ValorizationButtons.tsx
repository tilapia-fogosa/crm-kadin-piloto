
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ValorizationButtonsProps {
  clientId: string;
  clientName: string;
  scheduledDate: string | null;
  valorizationConfirmed: boolean;
  onValorizationChange: (confirmed: boolean) => void;
  onOpenSchedulingForm?: () => void;
}

export function ValorizationButtons({ 
  clientId, 
  clientName,
  scheduledDate, 
  valorizationConfirmed,
  onValorizationChange,
  onOpenSchedulingForm
}: ValorizationButtonsProps) {
  const { toast } = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  // Adicionando log para depuração
  console.log(`ValorizationButtons - Cliente ${clientId} - scheduledDate: ${scheduledDate}, confirmado: ${valorizationConfirmed}`);
  
  // Não exibir botões se não houver data de agendamento
  if (!scheduledDate) {
    console.log(`ValorizationButtons - Cliente ${clientId} - scheduledDate é null ou undefined, não exibindo botões`);
    return null;
  }

  const formattedDate = scheduledDate ? 
    format(parseISO(scheduledDate), "dd/MM/yy 'às' HH:mm", { locale: ptBR }) 
    : '';

  const handleConfirmAppointment = async () => {
    try {
      console.log(`Confirmando agendamento para cliente ${clientId}`);
      const { error } = await supabase
        .from('clients')
        .update({ 
          valorization_confirmed: true,
          next_contact_date: scheduledDate // Definindo a próxima data de contato como a data do agendamento
        })
        .eq('id', clientId);

      if (error) throw error;

      onValorizationChange(true);
      setIsConfirmDialogOpen(false);
      toast({
        title: "Agendamento Confirmado",
        description: "O agendamento foi confirmado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento.",
        variant: "destructive"
      });
    }
  };

  const handleCancelAppointment = async (reschedule: boolean) => {
    try {
      console.log(`Cancelando agendamento para cliente ${clientId}, remarcar: ${reschedule}`);
      
      // Definindo a data do próximo contato como agora
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('clients')
        .update({ 
          scheduled_date: null,
          valorization_confirmed: false,
          next_contact_date: now // Definindo next_contact_date para agora quando o agendamento é cancelado
        })
        .eq('id', clientId);

      if (error) throw error;

      onValorizationChange(false);
      setIsCancelDialogOpen(false);
      
      if (reschedule && onOpenSchedulingForm) {
        onOpenSchedulingForm();
      } else {
        toast({
          title: "Agendamento Cancelado",
          description: "O agendamento foi cancelado.",
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive"
      });
    }
  };

  if (valorizationConfirmed) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">Valorização</span>
        <span className="text-xs text-green-500 font-medium">Confirmado</span>
        <span className="text-xs text-green-500 font-medium">{formattedDate}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-muted-foreground">Valorização?</span>
      <span className="text-xs text-muted-foreground">{formattedDate}</span>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmDialogOpen(true);
          }}
        >
          <Check className="h-4 w-4" />
        </Button>
        
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsCancelDialogOpen(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={(open) => {
        // Evita a propagação de eventos ao fechar o diálogo
        if (!open) {
          setTimeout(() => setIsConfirmDialogOpen(false), 0);
        } else {
          setIsConfirmDialogOpen(open);
        }
      }}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Confirmar agendamento de {clientName}?
              <br />
              Cliente confirmou o agendamento no dia {formattedDate}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmAppointment();
              }}>
              Sim, Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={(open) => {
        // Evita a propagação de eventos ao fechar o diálogo
        if (!open) {
          setTimeout(() => setIsCancelDialogOpen(false), 0);
        } else {
          setIsCancelDialogOpen(open);
        }
      }}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Cancelar agendamento de {clientName}?
              <br />
              Deseja remarcar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleCancelAppointment(false);
              }}
            >
              Não, Cancelar
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleCancelAppointment(true);
              }}
            >
              Sim, Remarcar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
