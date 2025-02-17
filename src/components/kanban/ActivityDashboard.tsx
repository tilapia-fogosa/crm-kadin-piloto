
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivityDeletion } from "./hooks/useActivityDeletion";
import { useWhatsApp } from "./hooks/useWhatsApp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarDashboard } from "./CalendarDashboard";
import { ActivityHistory } from "./ActivityHistory";
import { EffectiveContactForm } from "./EffectiveContactForm";
import { SchedulingForm } from "./SchedulingForm";
import { ContactAttemptForm } from "./ContactAttemptForm";
import { ActivitySelector } from "./ActivitySelector";
import { formatDate } from "./utils/activityUtils";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ActivityDashboardProps {
  client: any;
  onClose: () => void;
  refetchClient: () => void;
}

export function ActivityDashboard({ client, onClose, refetchClient }: ActivityDashboardProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const whatsApp = useWhatsApp();
  const activityDeletion = useActivityDeletion();
  const { toast } = useToast();

  // Add null check for client
  if (!client || !client.id) {
    return <div>Carregando dados do cliente...</div>;
  }

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['clientActivities', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar atividades:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar atividades",
          description: "Ocorreu um erro ao buscar as atividades do cliente.",
        });
        return [];
      }
      return data;
    }
  });

  useEffect(() => {
    if (activitiesData) {
      setActivities(activitiesData as any[]);
    }
  }, [activitiesData]);

  const handleActivitySelection = (activityType: string) => {
    setSelectedActivity(activityType);
  };

  const renderActivityForm = () => {
    switch (selectedActivity) {
      case "tentativa-de-contato":
        return (
          <ContactAttemptForm
            cardId={client.id}
            onSubmit={async () => {
              await refetchActivities();
              await refetchClient();
            }}
          />
        );
      case "contato-efetivo":
        return (
          <EffectiveContactForm
            cardId={client.id}
            onSubmit={async () => {
              await refetchActivities();
              await refetchClient();
            }}
          />
        );
      case "agendamento":
        return (
          <SchedulingForm
            cardId={client.id}
            onSubmit={async () => {
              await refetchActivities();
              await refetchClient();
            }}
          />
        );
      default:
        return <p>Selecione um tipo de atividade.</p>;
    }
  };

  const getActivityDescription = (activityType: string | null) => {
    switch (activityType) {
      case "tentativa-de-contato":
        return "Registre uma nova tentativa de contato com o cliente.";
      case "contato-efetivo":
        return "Registre um contato efetivo com o cliente.";
      case "agendamento":
        return "Agende um atendimento com o cliente.";
      default:
        return "Selecione o tipo de atividade que deseja registrar.";
    }
  };

  const handleActivityDeletion = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('client_activities')
        .update({ active: false })
        .eq('id', activityId);

      if (error) {
        console.error("Erro ao inativar atividade:", error);
        toast({
          variant: "destructive",
          title: "Erro ao inativar atividade",
          description: "Ocorreu um erro ao tentar inativar a atividade.",
        });
        return;
      }

      toast({
        title: "Atividade removida!",
        description: "A atividade foi removida com sucesso.",
      });

      refetchActivities();
      refetchClient();
    } catch (error) {
      console.error("Erro ao inativar atividade:", error);
      toast({
        variant: "destructive",
        title: "Erro ao inativar atividade",
        description: "Ocorreu um erro ao tentar inativar a atividade.",
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 p-4 max-h-[80vh] overflow-hidden">
      {/* Primeira coluna */}
      <div className="space-y-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome</Label>
              <p className="text-sm">{client.name}</p>
            </div>
            <div>
              <Label>Telefone</Label>
              <p className="text-sm">{client.phone_number}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="text-sm">{client.status}</p>
            </div>
            <div>
              <Label>Data de Cadastro</Label>
              <p className="text-sm">{formatDate(client.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dashboard de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivitySelector
              selectedActivity={selectedActivity}
              onActivitySelect={handleActivitySelection}
            />
          </CardContent>
        </Card>
      </div>

      {/* Coluna do meio */}
      <div className="space-y-4 h-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Origem</Label>
              <p className="text-sm">{client.lead_source}</p>
            </div>
            <div>
              <Label>Anúncio</Label>
              <p className="text-sm">{client.original_ad || '-'}</p>
            </div>
            <div>
              <Label>Segmentação</Label>
              <p className="text-sm">{client.original_adset || '-'}</p>
            </div>
            <div>
              <Label>Observações</Label>
              <p className="text-sm whitespace-pre-wrap">{client.observations || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[calc(100%-280px)]">
          <CardHeader>
            <CardTitle className="text-lg">Atividade</CardTitle>
            <CardDescription>
              {getActivityDescription(selectedActivity)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-full pr-4">
              {renderActivityForm()}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Terceira coluna */}
      <div className="space-y-4 h-full">
        <Card className="h-[300px]">
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarDashboard clientId={client.id} />
          </CardContent>
        </Card>

        <Card className="h-[calc(100%-320px)]">
          <CardHeader>
            <CardTitle className="text-lg">Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100%-32px)] pr-4">
              <ActivityHistory
                activities={activities}
                onDeleteActivity={handleActivityDeletion}
                clientId={client.id}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
