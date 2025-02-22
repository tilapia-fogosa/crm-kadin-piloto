
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Clock, Calendar } from "lucide-react";
import { KanbanCard as KanbanCardType } from "./types";
import { format, parseISO, isBefore, isAfter, startOfDay, isToday } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KanbanCardProps {
  card: KanbanCardType;
  onClick: () => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
}

// Sistema de cores para status do próximo contato:
// Verde (#00CC00): Data futura (amanhã ou posterior)
// Amarelo (#FFD700): Hoje, antes do horário marcado
// Vermelho (#FF3333): Atrasado (data anterior ou após horário marcado hoje)
const getNextContactColor = (nextContactDate: Date | null): string => {
  if (!nextContactDate) return "text-muted-foreground";
  
  const now = new Date();
  const today = startOfDay(new Date());
  const contactDay = startOfDay(nextContactDate);

  // Verde: Data é amanhã ou posterior
  if (isAfter(contactDay, today)) {
    return "text-[#00CC00]"; // Verde suave
  }

  // Se for hoje, verifica o horário
  if (isToday(nextContactDate)) {
    // Vermelho: Já passou do horário
    if (isBefore(nextContactDate, now)) {
      return "text-[#FF3333]"; // Vermelho suave
    }
    // Amarelo: É hoje mas ainda não chegou o horário
    return "text-[#FFD700]"; // Amarelo dourado
  }

  // Vermelho: Data anterior
  return "text-[#FF3333]"; // Vermelho suave
}

export function KanbanCard({
  card,
  onClick,
  onWhatsAppClick
}: KanbanCardProps) {
  const createdAtDate = parseISO(card.createdAt);
  const isValidDate = !isNaN(createdAtDate.getTime());
  const nextContactDate = card.nextContactDate ? parseISO(card.nextContactDate) : null;
  const nextContactColor = getNextContactColor(nextContactDate);
  
  return (
    <Card 
      className="cursor-pointer bg-[#8A898C] hover:bg-primary/20 transition-colors duration-200"
      onClick={onClick}
    >
      <CardHeader className="p-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base -mt-1 text-white">{card.clientName}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isValidDate ? format(createdAtDate, 'dd-MM-yy HH:mm') : 'Data inválida'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data de cadastro do cliente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {nextContactDate && (
            <div className={`flex items-center gap-1 text-xs ${nextContactColor} px-0 py-0 rounded-none font-medium`}>
              <Clock className="h-3 w-3" />
              {format(nextContactDate, 'dd-MM-yy HH:mm')}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          <p className="text-sm text-white/80">
            Origem: {card.leadSource}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={onWhatsAppClick}>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </Button>
            <Phone className="h-4 w-4 text-white" />
            <span className="text-sm text-white">{card.phoneNumber}</span>
          </div>
          {card.labels && (
            <div className="mt-1 flex flex-wrap gap-1">
              {card.labels.map(label => (
                <span key={label} className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
