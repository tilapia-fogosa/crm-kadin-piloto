
import React, { useCallback, memo } from 'react';
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

function KanbanCardComponent({
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
  const contactsCount = card.activities?.filter(
    activity => 
      ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento']
        .includes(activity.split('|')[1])
  ).length || 0;

  const schedulingCount = card.activities?.filter(
    activity => activity.split('|')[1] === 'Agendamento'
  ).length || 0;

  const createdAtDate = parseISO(card.createdAt);
  const isValidDate = !isNaN(createdAtDate.getTime());
  const nextContactDate = card.nextContactDate ? parseISO(card.nextContactDate) : null;
  const nextContactColor = getNextContactColor(nextContactDate);
  
  console.log(`KanbanCard - Cliente ${card.id} - scheduledDate: ${card.scheduledDate}, valorizationConfirmed: ${card.valorizationConfirmed}`);
  console.log(`KanbanCard - Cliente ${card.id} - registrationName: ${card.registrationName || 'não definido'}`);
  
  const handleValorizationChange = useCallback((confirmed: boolean) => {
    console.log(`Valorização mudou para: ${confirmed}`);
    card.valorizationConfirmed = confirmed;
  }, [card]);

  return (
    <Card 
      className="group cursor-pointer bg-[#F5F5F5] hover:bg-[#F8E4CC]/10 transition-colors duration-200 relative"
      onClick={onClick}
    >
      <CardHeader className="p-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base -mt-1 text-[#333333]">
              {card.quantidadeCadastros && card.quantidadeCadastros > 1 && (
                <span className="text-orange-600 font-bold mr-1">{`{${card.quantidadeCadastros}}`}</span>
              )}
              {card.clientName}
            </CardTitle>
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
          
          {card.registrationName && (
            <p className="text-sm text-[#666666]">
              Registro: {card.registrationName}
            </p>
          )}
          
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

          <div 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Clique nos botões de valorização interceptado');
            }}
          >
            <ValorizationButtons 
              clientId={card.id}
              clientName={card.clientName}
              scheduledDate={card.scheduledDate}
              valorizationConfirmed={card.valorizationConfirmed || false}
              onValorizationChange={handleValorizationChange}
              onOpenSchedulingForm={onOpenSchedulingForm}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoizar o componente comparando apenas campos relevantes que afetam a renderização
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  const prevCard = prevProps.card;
  const nextCard = nextProps.card;
  
  // Comparação otimizada usando timestamp se disponível
  if (prevCard.lastUpdated && nextCard.lastUpdated) {
    const isEqual = prevCard.lastUpdated === nextCard.lastUpdated;
    if (!isEqual) {
      console.log(`🔄 [KanbanCard] Card ${nextCard.clientName} atualizado - timestamp mudou`);
    }
    return isEqual;
  }
  
  // Fallback para comparação detalhada se não houver timestamp
  const isEqual = (
    prevCard.id === nextCard.id &&
    prevCard.clientName === nextCard.clientName &&
    prevCard.nextContactDate === nextCard.nextContactDate &&
    prevCard.scheduledDate === nextCard.scheduledDate &&
    prevCard.valorizationConfirmed === nextCard.valorizationConfirmed &&
    prevCard.leadSource === nextCard.leadSource &&
    prevCard.registrationName === nextCard.registrationName &&
    prevCard.phoneNumber === nextCard.phoneNumber &&
    prevCard.quantidadeCadastros === nextCard.quantidadeCadastros &&
    JSON.stringify(prevCard.activities) === JSON.stringify(nextCard.activities)
  );
  
  if (!isEqual) {
    console.log(`🔄 [KanbanCard] Card ${nextCard.clientName} atualizado - campos mudaram`);
  }
  
  return isEqual;
});
