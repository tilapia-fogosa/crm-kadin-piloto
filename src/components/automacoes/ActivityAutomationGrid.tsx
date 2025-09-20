import { Phone, CheckCircle, Calendar, Users, GraduationCap, XCircle } from "lucide-react";
import { ActivityAutomationCard, ActivityType } from "./ActivityAutomationCard";
import { useAutomationStats } from "./hooks/useAutomationStats";

// Log: Grid de cards de automação por atividade
export function ActivityAutomationGrid() {
  console.log('ActivityAutomationGrid: Renderizando grid de atividades');
  
  const stats = useAutomationStats();

  const activities: ActivityType[] = [
    {
      id: 'tentativa_contato',
      name: 'Tentativa de Contato',
      icon: <Phone className="w-5 h-5 text-primary" />,
      created: stats.tentativa_contato.created,
      active: stats.tentativa_contato.active,
      dispatches: stats.tentativa_contato.dispatches,
    },
    {
      id: 'contato_efetivo',
      name: 'Contato Efetivo',
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      created: stats.contato_efetivo.created,
      active: stats.contato_efetivo.active,
      dispatches: stats.contato_efetivo.dispatches,
    },
    {
      id: 'agendamento',
      name: 'Agendamento',
      icon: <Calendar className="w-5 h-5 text-primary" />,
      created: stats.agendamento.created,
      active: stats.agendamento.active,
      dispatches: stats.agendamento.dispatches,
    },
    {
      id: 'atendimento',
      name: 'Atendimento',
      icon: <Users className="w-5 h-5 text-primary" />,
      created: stats.atendimento.created,
      active: stats.atendimento.active,
      dispatches: stats.atendimento.dispatches,
    },
    {
      id: 'matricula',
      name: 'Matrícula',
      icon: <GraduationCap className="w-5 h-5 text-primary" />,
      created: stats.matricula.created,
      active: stats.matricula.active,
      dispatches: stats.matricula.dispatches,
    },
    {
      id: 'perdido',
      name: 'Perdido',
      icon: <XCircle className="w-5 h-5 text-primary" />,
      created: stats.perdido.created,
      active: stats.perdido.active,
      dispatches: stats.perdido.dispatches,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((activity) => (
        <ActivityAutomationCard 
          key={activity.id} 
          activity={activity} 
        />
      ))}
    </div>
  );
}