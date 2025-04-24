import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, Calendar } from "lucide-react";
import { KanbanCard as KanbanCardType } from "./types";
import { format, parseISO, isBefore, isAfter, startOfDay, isToday } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WhatsAppIcon } from "./components/icons/WhatsAppIcon";
import { ValorizationButtons } from './components/ValorizationButtons';
import { Badge } from "@/components/ui/badge";

const getNextContactColor = (nextContactDate: Date | null): string => {
  if (!nextContactDate) return "text-muted-foreground";
  
  const now = new Date();
  const today = startOfDay(new Date());
  const contactDay = startOfDay(nextContactDate);

  if (isAfter(contactDay, today)) {
    return "text-[#00CC00]";
  }

  if (isToday(nextContactDate)) {
    if (isBefore(nextContactDate, now)) {
      return "text-[#FF3333]";
    }
    return "text-[#CCA405]";
  }

  return "text-[#FF3333]";
}

export function KanbanCard({
  card,
  onClick,
  onWhatsAppClick,
  onOpenSchedulingForm
}: {
  card: KanbanCardType;
  onClick: () => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
  onOpenSchedulingForm?: () => void;
}) {
  const contactsCount = card.activities.filter(
    activity => 
      ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento']
        .includes(activity.split('|')[1])
  ).length;

  const schedulingCount = card.activities.filter(
    activity => activity.split('|')[1] === 'Agendamento'
  ).length;

  const createdAtDate = parseISO(card.createdAt);
  const isValidDate = !isNaN(createdAtDate.getTime());
  const nextContactDate = card.nextContactDate ? parseISO(card.nextContactDate) : null;
  const nextContactColor = getNextContactColor(nextContactDate);
  
  return (
    <Card 
      className="cursor-pointer bg-[#F5F5F5] hover:bg-[#F8E4CC]/10 transition-colors duration-200 relative"
      onClick={onClick}
    >
      <CardHeader className="p-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base -mt-1 text-[#333333]">{card.clientName}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <Calendar className="h-3 w-3" />
                    <span>{isValidDate ? format(createdAtDate, 'dd-MM-yy HH:mm') : 'Data inválida'}</span>
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
      
      <CardContent className="p-2 relative">
        <div className="space-y-1">
          <p className="text-sm text-[#666666]">
            Origem: {card.leadSource}
          </p>
          
          <div className="flex items-center gap-2">
            <WhatsAppIcon 
              className="h-4 w-4 text-green-500 cursor-pointer" 
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onWhatsAppClick(e);
              }} 
            />
            <Phone className="h-4 w-4 text-[#333333]" />
            <span className="text-sm text-[#333333]">{card.phoneNumber}</span>
          </div>
          
          {card.labels && (
            <div className="mt-1 flex flex-wrap gap-1">
              {card.labels.map(label => (
                <span 
                  key={label} 
                  className="rounded-full bg-[#2725C]/10 px-2 py-0.5 text-xs font-medium text-[#333333]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          {contactsCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              Contatos: {contactsCount}
            </Badge>
          )}
          
          {schedulingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              Agenda: {schedulingCount}
            </Badge>
          )}

          <ValorizationButtons 
            clientId={card.id}
            clientName={card.clientName}
            scheduledDate={card.scheduledDate}
            valorizationConfirmed={card.valorizationConfirmed || false}
            onValorizationChange={(confirmed) => {
              card.valorizationConfirmed = confirmed;
            }}
            onOpenSchedulingForm={onOpenSchedulingForm}
          />
        </div>
      </CardContent>
    </Card>
  );
}
