import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanColumn } from "./KanbanColumn"
import { ContactAttempt } from "./types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function KanbanBoard() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
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

  const columns = [
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

  const handleRegisterAttempt = async (attempt: ContactAttempt) => {
    try {
      console.log("Registering attempt:", attempt);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error: activityError } = await supabase
        .from('client_activities')
        .insert({
          client_id: attempt.cardId,
          type: attempt.type,
          next_contact_date: attempt.nextContactDate.toISOString(),
          created_by: session.session.user.id
        });

      if (activityError) throw activityError;

      const { error: statusError } = await supabase
        .from('clients')
        .update({ status: 'tentativa-contato' })
        .eq('id', attempt.cardId);

      if (statusError) throw statusError;

      toast({
        title: "Tentativa registrada",
        description: "O lead foi movido para 'Em tentativa de Contato'",
      });
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
          <KanbanColumn
            key={column.id}
            column={column}
            onWhatsAppClick={handleWhatsAppClick}
            onRegisterAttempt={handleRegisterAttempt}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard