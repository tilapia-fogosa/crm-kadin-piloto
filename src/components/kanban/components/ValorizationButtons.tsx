
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReschedulingDialog } from './scheduling/ReschedulingDialog';

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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false);

  console.log(`ValorizationButtons - Cliente ${clientId} - scheduledDate: ${scheduledDate}, confirmado: ${valorizationConfirmed}`);
  
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
    console.log(`Cancelando/Reagendando para cliente ${clientId}, remarcar: ${reschedule}`);
    
    if (reschedule) {
      setIsCancelDialogOpen(false);
      setIsReschedulingDialogOpen(true);
    } else {
      try {
        const { error } = await supabase
          .from('clients')
          .update({ 
            scheduled_date: null,
            valorization_confirmed: false,
            next_contact_date: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) throw error;

        onValorizationChange(false);
        setIsCancelDialogOpen(false);
        
        toast({
          title: "Agendamento Cancelado",
          description: "O agendamento foi cancelado.",
        });
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível cancelar o agendamento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleReschedulingSuccess = async () => {
    console.log('Novo agendamento criado com sucesso');
    onValorizationChange(false);
    setIsReschedulingDialogOpen(false);
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
    <>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">Valorização?</span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsConfirmDialogOpen(true);
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsCancelDialogOpen(true);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Dialog 
        open={isConfirmDialogOpen} 
        onOpenChange={setIsConfirmDialogOpen}
      >
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
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={() => handleConfirmAppointment()}>
              Sim, Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isCancelDialogOpen} 
        onOpenChange={setIsCancelDialogOpen}
      >
        <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Atendimento</DialogTitle>
            <DialogDescription>
              Cancelar atendimento de {clientName}?
              <br />
              Deseja reagendar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleCancelAppointment(false)}
            >
              Não, Cancelar
            </Button>
            <Button 
              onClick={() => handleCancelAppointment(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Sim, Reagendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReschedulingDialog
        open={isReschedulingDialogOpen}
        onOpenChange={setIsReschedulingDialogOpen}
        clientId={clientId}
        clientName={clientName}
        onSubmit={handleReschedulingSuccess}
      />
    </>
  );
}
