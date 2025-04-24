
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ValorizationButtonsProps {
  clientId: string;
  scheduledDate: string | null;
  valorizationConfirmed: boolean;
  onValorizationChange: (confirmed: boolean) => void;
}

export function ValorizationButtons({ 
  clientId, 
  scheduledDate, 
  valorizationConfirmed,
  onValorizationChange 
}: ValorizationButtonsProps) {
  const { toast } = useToast();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isReschedule, setIsReschedule] = React.useState(false);

  const handleConfirmAppointment = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          valorization_confirmed: true 
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
      const updateData: { 
        scheduled_date: null, 
        next_contact_date?: string, 
        valorization_confirmed?: boolean 
      } = { 
        scheduled_date: null 
      };

      if (!reschedule) {
        updateData.next_contact_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId);

      if (error) throw error;

      onValorizationChange(false);
      setIsCancelDialogOpen(false);
      
      if (reschedule) {
        // Lógica para abrir formulário de agendamento
        toast({
          title: "Reagendamento",
          description: "Abrir formulário de agendamento.",
        });
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

  // Não exibir botões se não houver data de agendamento
  if (!scheduledDate) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={valorizationConfirmed ? 'default' : 'outline'}
        size="icon"
        className={`h-8 w-8 ${valorizationConfirmed ? 'bg-green-500 text-white' : ''}`}
        onClick={() => setIsConfirmDialogOpen(true)}
      >
        <Check className="h-4 w-4" />
      </Button>
      
      <Button
        variant="destructive"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsCancelDialogOpen(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Cliente confirmou o agendamento no dia {new Date(scheduledDate).toLocaleDateString()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmAppointment}>Sim, Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              O cliente cancelou o agendamento. Deseja remarcar?
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
              onClick={() => {
                handleCancelAppointment(true);
                // Futuramente, adicionar lógica para abrir formulário de agendamento
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
