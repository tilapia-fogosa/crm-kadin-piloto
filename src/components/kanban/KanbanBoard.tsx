import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanCard } from "./KanbanCard"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { KanbanColumn, KanbanCard as KanbanCardType, ContactAttempt } from "./types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function KanbanBoard() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          lead_source,
          observations,
          status,
          client_activities (
            type,
            notes,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const columns: KanbanColumn[] = [
    {
      id: "novo-cadastro",
      title: "Novo Cadastro",
      cards: clients
        ?.filter(client => client.status === 'novo-cadastro')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map(activity => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
    {
      id: "tentativa-contato",
      title: "Em tentativa de Contato",
      cards: clients
        ?.filter(client => client.status === 'tentativa-contato')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map(activity => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
    {
      id: "contato-efetivo",
      title: "Contato Efetivo",
      cards: clients
        ?.filter(client => client.status === 'contato-efetivo')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map(activity => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
    {
      id: "atendimento-agendado",
      title: "Atendimento Agendado",
      cards: clients
        ?.filter(client => client.status === 'atendimento-agendado')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map(activity => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
    {
      id: "atendimento-realizado",
      title: "Atendimento Realizado",
      cards: clients
        ?.filter(client => client.status === 'atendimento-realizado')
        .map(client => ({
          id: client.id,
          clientName: client.name,
          leadSource: client.lead_source,
          phoneNumber: client.phone_number,
          activities: client.client_activities?.map(activity => 
            `${activity.type} - ${format(new Date(activity.created_at), "dd/MM/yyyy HH:mm")}`
          ),
        })) || [],
    },
  ];

  const handleDateSelect = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const handleWhatsAppClick = (e: React.MouseEvent, phoneNumber: string) => {
    e.stopPropagation()
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, '_blank')
  }

  const activities = [
    { id: 'tentativa', label: 'Tentativa de Contato' },
    { id: 'efetivo', label: 'Contato Efetivo' },
    { id: 'agendamento', label: 'Agendamento' },
    { id: 'atendimento', label: 'Atendimento' },
  ]

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
  }

  const handleRegisterAttempt = async (attempt: ContactAttempt) => {
    try {
      console.log("Registering attempt:", attempt);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      // Add activity
      const { error: activityError } = await supabase
        .from('client_activities')
        .insert([{
          client_id: attempt.cardId,
          type: attempt.type,
          next_contact_date: attempt.nextContactDate,
          created_by: session.session.user.id
        }]);

      if (activityError) throw activityError;

      // Update client status
      const { error: statusError } = await supabase
        .from('clients')
        .update({ status: 'tentativa-contato' })
        .eq('id', attempt.cardId);

      if (statusError) throw statusError;

      toast({
        title: "Tentativa registrada",
        description: "O lead foi movido para 'Em tentativa de Contato'",
      });

      // Close the dialog by clearing the selected card
      setSelectedCard(null);
    } catch (error) {
      console.error('Error registering attempt:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar tentativa",
        description: "Ocorreu um erro ao tentar registrar a tentativa de contato.",
      });
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Consultor</h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDateSelect({} as React.MouseEvent, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex w-80 flex-none flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{column.title}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                {column.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {column.cards.map((card) => (
                <Dialog key={card.id} open={selectedCard?.id === card.id} onOpenChange={(open) => !open && setSelectedCard(null)}>
                  <DialogTrigger asChild>
                    <div onClick={() => setSelectedCard(card)}>
                      <KanbanCard
                        card={card}
                        onClick={() => setSelectedCard(card)}
                        onWhatsAppClick={(e) => handleWhatsAppClick(e, card.phoneNumber)}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Atividades - {card.clientName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        {activities.map((activity) => (
                          <Button
                            key={activity.id}
                            variant="outline"
                            className={cn(
                              "justify-start",
                              selectedActivity === activity.id && "bg-primary/10"
                            )}
                            onClick={() => handleActivitySelect(activity.id)}
                          >
                            {activity.label}
                          </Button>
                        ))}
                      </div>
                      <div className="border-l pl-4">
                        {selectedActivity === 'tentativa' ? (
                          <ContactAttemptForm
                            onSubmit={handleRegisterAttempt}
                            cardId={card.id}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Selecione uma atividade para ver as opções
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard